using System;
using System.Collections.Generic;
using MatchMaking.API.Models;

namespace MatchMaking.API.Dtos
{
    public class UserForRecommendDto
    {
        public string bios { get; set; }
        public List<int> scoreList { get; set; }
        
    }
}