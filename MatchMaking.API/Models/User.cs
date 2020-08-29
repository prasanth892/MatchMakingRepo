using System;
using System.Collections.Generic;

namespace MatchMaking.API.Models
{
    public class User
    {
        public int Id { get; set; }
        public string Username { get; set; }
        public Byte[] PasswordHash { get; set; }
        public Byte[] PasswordSalt { get; set; }
        public string Gender { get; set; }
        public DateTime DateOfBirth { get; set; }
        public string KnownAs { get; set; }
        public DateTime Created { get; set; }
        public DateTime LastActive { get; set; }
        public string LookingFor { get; set; }
        public string City { get; set; }
        public string Country { get; set; }

        public string Bios { get; set; }
        public string Movies { get; set; }
        public string TV { get; set; }
        public string Religion { get; set; }
        public string Music { get; set; }
        public string Sports { get; set; }
        public string Books { get; set; }
        public string Politics { get; set; }

        public ICollection<Photo> Photos { get; set; }
        public ICollection<Like> Likers { get; set; }
        public ICollection<Like> Likees { get; set; }


    }
}