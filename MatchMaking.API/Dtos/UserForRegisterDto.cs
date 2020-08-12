using System.ComponentModel.DataAnnotations;

namespace MatchMaking.API.Dtos
{
    public class UserForRegisterDto
    {
        [Required]
        public string Username { get; set; }
        
        [Required]
        [StringLength(8, MinimumLength=4, ErrorMessage="Password must be 4 and 8 characters")]
        public string Password { get; set; }
    }
}