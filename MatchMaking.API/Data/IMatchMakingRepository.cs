using System.Collections.Generic;
using System.Threading.Tasks;
using MatchMaking.API.Helpers;
using MatchMaking.API.Models;

namespace MatchMaking.API.Data
{
    public interface IMatchMakingRepository
    {
        void Add<T>(T entity) where T : class;
        void Delete<T>(T entity) where T: class;
        Task<bool> SaveAll();
        Task<PagedList<User>> GetUsers(UserParams userParams);
        Task<User> GetUser(int userId);

        Task<Photo> GetPhoto(int id);
        Task<Photo> GetMainPhotoForUser(int userId);
        Task<Like> GetLike(int userId, int reciepientId);
        
        IEnumerable<User> GetRecommendedProfiles(List<int> ids);

        Task<User> SearchUser(int id, string searchString);

        Task<Message> GetMessage(int id);
        Task<PagedList<Message>> GetMessagesForUser(MessageParams messageParams);
        Task<IEnumerable<Message>> GetMessageThread(int userId, int recipientId);

        
    }
}