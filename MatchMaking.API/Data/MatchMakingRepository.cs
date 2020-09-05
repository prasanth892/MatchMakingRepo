using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Formatting;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Threading.Tasks;
using MatchMaking.API.Helpers;
using MatchMaking.API.Models;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace MatchMaking.API.Data
{
    public class MatchMakingRepository : IMatchMakingRepository
    {
        private readonly DataContext context;

        public MatchMakingRepository(DataContext context)
        {
            this.context = context;
        }

        public void Add<T>(T entity) where T : class
        {
            context.Add(entity);
        }

        public void Delete<T>(T entity) where T : class
        {
            context.Remove(entity);
        }

        public async Task<Like> GetLike(int userId, int recipientId)
        {
            var result = await context.Likes.FirstOrDefaultAsync(u => u.LikerId == userId && u.LikeeId == recipientId);
            return result;
        }

        public async Task<Photo> GetMainPhotoForUser(int userId)
        {
            return await context.Photos.Where(p => p.UserId == userId)
                        .FirstOrDefaultAsync(p => p.IsMain);
        }

        public async Task<Photo> GetPhoto(int id)
        {
            var photo = await context.Photos.FirstOrDefaultAsync(p => p.Id == id);

            return photo;
        }

        public async Task<User> GetUser(int userId)
        {
            var user = await context.Users.Include(p => p.Photos).FirstOrDefaultAsync(u => u.Id == userId);

            return user;
        }

        public async Task<PagedList<User>> GetUsers(UserParams userParams)
        {
            var users = context.Users.Include(p => p.Photos).OrderByDescending(u => u.LastActive)
            .AsQueryable();

            users = users.Where(u => u.Id != userParams.UserId); // skip user profile from adding

            users = users.Where(u => u.Gender == userParams.Gender);

            if (userParams.Country != null)
                users = users.Where(u => u.Country == userParams.Country);

            if (userParams.Likers)
            {
                var userLikers = await GetUserLikes(userParams.UserId, userParams.Likers);
                users = users.Where(u => userLikers.Contains(u.Id));
            }

            if (userParams.Likees)
            {
                var userLikees = await GetUserLikes(userParams.UserId, userParams.Likers);
                users = users.Where(u => userLikees.Contains(u.Id));
            }

            if (userParams.MinAge != 18 || userParams.MaxAge != 99)
            {
                var minDob = DateTime.Today.AddYears(-userParams.MaxAge - 1);
                var maxDob = DateTime.Today.AddYears(-userParams.MinAge);

                users = users.Where(u => u.DateOfBirth >= minDob && u.DateOfBirth <= maxDob);
            }

            if (!string.IsNullOrEmpty(userParams.OrderBy))
            {
                switch (userParams.OrderBy)
                {
                    case "created":
                        users = users.OrderByDescending(u => u.Created);
                        break;

                    default:
                        users = users.OrderByDescending(u => u.LastActive);
                        break;
                }
            }

            return await PagedList<User>.CreateAsync(users, userParams.PageNumber, userParams.PageSize);
        }

        private async Task<IEnumerable<int>> GetUserLikes(int userId, bool likers)
        {
            var user = await context.Users.Include(x => x.Likers)
                                        .Include(x => x.Likees)
                                        .FirstOrDefaultAsync(u => u.Id == userId);

            if (likers)
            {
                return user.Likers.Where(u => u.LikeeId == userId).Select(i => i.LikerId);
            }
            else
            {
                return user.Likees.Where(u => u.LikerId == userId).Select(i => i.LikeeId);
            }
        }

        public async Task<bool> SaveAll()
        {
            return await context.SaveChangesAsync() > 0;

        }

        public IEnumerable<User> GetRecommendedProfiles(List<int> ids)
        {
            return context.Users.Include(p => p.Photos).Where(u => ids.Contains(u.Id));
        }


        public async Task<User> SearchUser(int id, string searchString)
        {
            var currentUser = await GetUser(id);

            int integerId;

            bool isInteger = int.TryParse(searchString, out integerId);

            if (isInteger)
            {
                // Seach by ID
                var user = await context.Users.Include(p => p.Photos).FirstOrDefaultAsync(u => u.Id == integerId);
                if(user == null)
                    return null;

                if(user.Gender == currentUser.Gender)
                {
                    user.Gender =  "same gender";
                    
                }
                
                return user;
            }
            else
            {
                // Seach by Email
                var user = await context.Users.Include(p => p.Photos).FirstOrDefaultAsync(u => u.Username == searchString);

                return user == null ? null : user;
            }

        }

        public async Task<Message> GetMessage(int id)
        {
            return await context.Messages.FirstOrDefaultAsync(m => m.Id == id);
        }

        public async Task<PagedList<Message>> GetMessagesForUser(MessageParams messageParams)
        {
            var messages = context.Messages.Include(u => u.Sender).ThenInclude(p => p.Photos)
                        .Include(u => u.Recipient).ThenInclude(p => p.Photos).AsQueryable();

            switch (messageParams.MessageContainer)
            {
                case "Inbox":
                    messages = messages.Where(u => u.RecipientId == messageParams.UserId);
                    break;

                case "Outbox":
                    messages = messages.Where(u => u.SenderId == messageParams.UserId);
                    break;

                default:
                    messages = messages.Where(u => u.RecipientId == messageParams.UserId && u.IsRead == false);
                    break;
            }

            messages = messages.OrderByDescending(d => d.MessageSent);
            
            return await PagedList<Message>.CreateAsync(messages, messageParams.PageNumber, messageParams.PageSize);
        }

        public async Task<IEnumerable<Message>> GetMessageThread(int userId, int recipientId)
        {
            var messages = await context.Messages.Include(u => u.Sender).ThenInclude(p => p.Photos)
                                            .Include(u => u.Recipient).ThenInclude(p => p.Photos)
                                            .Where(m => m.RecipientId == userId && m.SenderId == recipientId 
                                            || m.RecipientId == recipientId && m.SenderId == userId)
                                            .OrderByDescending(m => m.MessageSent)
                                            .ToListAsync();

            return messages;           
        }
    }
}