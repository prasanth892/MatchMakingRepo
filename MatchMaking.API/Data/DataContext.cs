using Microsoft.EntityFrameworkCore;
using MatchMaking.API.Models;

namespace MatchMaking.API.Data
{

    public class DataContext : DbContext
    {
        public DataContext(DbContextOptions<DataContext> options): base(options) {}

        public DbSet<Value> Value { get; set; }
    }
}