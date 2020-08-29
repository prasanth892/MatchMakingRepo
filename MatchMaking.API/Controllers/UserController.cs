using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using AutoMapper;
using MatchMaking.API.Data;
using MatchMaking.API.Dtos;
using MatchMaking.API.Helpers;
using MatchMaking.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MatchMaking.API.Controllers
{
    [ServiceFilter(typeof(LogUserActivity))]
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
        public async Task<IActionResult> GetUsers([FromQuery]UserParams userParams)
        {
            var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);

            var userFromRepo = await repo.GetUser(currentUserId);

            userParams.UserId = currentUserId;

            if (string.IsNullOrEmpty(userParams.Gender))
            {
                userParams.Gender = userFromRepo.Gender == "male" ? "female" : "male";
            }

            var users = await repo.GetUsers(userParams);

            var usersToReturn = mapper.Map<IEnumerable<UserForListDto>>(users);
            Response.AddPagination(users.CurrentPage, users.PageSize, users.TotalCount, users.TotalPages);

            return Ok(usersToReturn);
        }

        [HttpGet("getuser/{id}", Name = "getuser")]
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

            if (await repo.SaveAll())
                return NoContent();

            throw new Exception($"Updating user {id} failed on save");
        }

        [HttpPost("{id}/like/{recipientid}")]
        public async Task<IActionResult> LikeUser(int id, int recipientId)
        {
            // Check the current user sending the request for changes.
            if (id != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
            {
                return Unauthorized();
            }

            var like = await repo.GetLike(id, recipientId);

            if (like != null)
                return BadRequest("You already liked this user");

            if (await repo.GetUser(recipientId) == null)
                return NotFound();

            var liking = new Like
            {
                LikerId = id,
                LikeeId = recipientId
            };

            repo.Add<Like>(liking);

            if (await repo.SaveAll())
                return Ok();

            return BadRequest("Error in processing like");




        }

    }
}
