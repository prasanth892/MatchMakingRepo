using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Formatting;
using System.Net.Http.Headers;
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
    }
}