using System.Collections.Generic;
using System.Threading.Tasks;
using MatchMaking.API.Models;

namespace MatchMaking.API.Data
{
    public interface IMatchMakingRepository
    {
        void Add<T>(T entity) where T : class;
        void Delete<T>(T entity) where T: class;
        Task<bool> SaveAll();
        Task<IEnumerable<User>> GetUsers();
        Task<User> GetUser(int userId);




    }
}