using System;

namespace MatchMaking.API.Models
{
    public class User
    {
        public int Id { get; set; }
        public string Username { get; set; }
        public Byte[] PasswordHash { get; set; }
        public Byte[] PasswordSalt { get; set; }
    
    }
}