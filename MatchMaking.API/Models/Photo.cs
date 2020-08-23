using System;


namespace MatchMaking.API.Models
{
    public class Photo
    {
        public int Id { get; set; }
        public string Url { get; set; }
        public string  Description { get; set; }
        public DateTime DatedAdded { get; set; }
        public bool IsMain { get; set; }
        public User User { get; set; } // To make ef migrations CASCADE Delete Photoes
        public int UserId { get; set; } // To make ef migrations CASCADE Delete Photoes

    }
}