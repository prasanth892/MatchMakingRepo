using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using AutoMapper;
using MatchMaking.API.Data;
using MatchMaking.API.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MatchMaking.API.Controllers
{
    [Authorize]
    [Route("[controller]")]
    [ApiController]

    public class UserController : ControllerBase
    {
        private readonly IMatchMakingRepository repo;
        private readonly IMapper mapper;
        public UserController(IMatchMakingRepository repo, IMapper mapper)
        {
            this.mapper = mapper;
            this.repo = repo;
        }

        [HttpGet("getusers")]
        public async Task<IActionResult> GetUsers()
        {
            var users = await repo.GetUsers();
            
            var usersToReturn = mapper.Map<IEnumerable<UserForListDto>>(users);

            return Ok(usersToReturn);

        }

        [HttpGet("getuser/{id}")]
        public async Task<IActionResult> GetUser(int id)
        {
            var user = await repo.GetUser(id);
 
            var userToReturn = mapper.Map<UserForDetailDto>(user);
            
            return Ok(userToReturn);
        }

        [HttpPut("updateuser/{id}")]
        public async Task<IActionResult> UpdateUser(int id, UserForUpdateDto userForUpdate)
        {
            if (id != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
                return Unauthorized();
            
            var userToUpdate = await repo.GetUser(id);

            mapper.Map(userForUpdate, userToUpdate);
            
            if(await repo.SaveAll())
                return NoContent();

            throw new Exception($"Updating user {id} failed on save");
        }



    }
}
