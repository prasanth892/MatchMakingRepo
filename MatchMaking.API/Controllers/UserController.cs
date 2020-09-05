using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Formatting;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using MatchMaking.API.Data;
using MatchMaking.API.Dtos;
using MatchMaking.API.Helpers;
using MatchMaking.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;

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
        public async Task<IActionResult> GetUsers([FromQuery] UserParams userParams)
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
 
            List<int> userScoreList = new List<int>();

            userScoreList.Add(int.Parse(userForUpdate.Movies));
            userScoreList.Add(int.Parse(userForUpdate.TV));
            userScoreList.Add(int.Parse(userForUpdate.Religion));
            userScoreList.Add(int.Parse(userForUpdate.Music));
            userScoreList.Add(int.Parse(userForUpdate.Sports));
            userScoreList.Add(int.Parse(userForUpdate.Books));
            userScoreList.Add(int.Parse(userForUpdate.Politics));

            var userToMl = new
            {
                bios = userForUpdate.Bios,
                scoreList = userScoreList,
                userId = id
            };

            string apiResponse = "";
            using (var httpClient = new HttpClient())
            {
                StringContent content = new StringContent(JsonConvert.SerializeObject(userToMl), Encoding.UTF8, "application/json");

                using (var response = await httpClient.PostAsync("http://127.0.0.1:8080/updateProfile", content))
                {
                        apiResponse = await response.Content.ReadAsStringAsync();
                }
            }

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

        // Get Recommendations
        [HttpPost("recommendations/{id}", Name = "recommendations")]
        public async Task<IActionResult> GetRecommend(int id)
        {

            var user = await repo.GetUser(id);

            if (user == null)
            {
                return Unauthorized();
            }
            else
            {
                List<int> userScoreList = new List<int>();

                userScoreList.Add(int.Parse(user.Movies));
                userScoreList.Add(int.Parse(user.TV));
                userScoreList.Add(int.Parse(user.Religion));
                userScoreList.Add(int.Parse(user.Music));
                userScoreList.Add(int.Parse(user.Sports));
                userScoreList.Add(int.Parse(user.Books));
                userScoreList.Add(int.Parse(user.Politics));

                UserForRecommendDto userToRecommend = new UserForRecommendDto()
                {
                    bios = user.Bios,
                    scoreList = userScoreList
                };
                                
                string apiResponse = "";
                using (var httpClient = new HttpClient())
                {
                    StringContent content = new StringContent(JsonConvert.SerializeObject(userToRecommend), Encoding.UTF8, "application/json");

                    using (var response = await httpClient.PostAsync("http://127.0.0.1:8080/reccomendProfiles", content))
                    {
                        apiResponse = await response.Content.ReadAsStringAsync();
                    }
                }

                var idString = apiResponse.Replace(" ", string.Empty).Substring(5);

                Dictionary<string, float> recommendedList = new Dictionary<string, float>();
                string recId = "";
                float match = 0;
                List<int> idsList = new List<int>();

                string[] ids = idString.Split('\n');
                ids = ids.Take(ids.Count() - 1).ToArray();

                for (int i = 0; i < ids.Length; i++)
                {
                    int charLocation = ids[i].IndexOf(".", StringComparison.Ordinal);

                    recId = ids[i].Substring(0, charLocation - 1);
                    idsList.Add(int.Parse(recId));
                    match = float.Parse(ids[i].Substring(charLocation - 1, 8));
                    recommendedList.Add(recId, match);
                }


                var recUserProfiles = repo.GetRecommendedProfiles(idsList);

                var returnDto = new List<ReturnRecommendDto>();

                for (int i = 0; i < recUserProfiles.Count(); i++)
                {
                    var profile = recUserProfiles.ToList()[i];
                    var mappedProfile = mapper.Map<ReturnRecommendDto>(profile);

                    for (int j = 0; j < recUserProfiles.Count(); j++)
                    {
                        if (mappedProfile.Id == int.Parse(recommendedList.ElementAt(j).Key))
                        {
                            mappedProfile.MatchingPercent = recommendedList.ElementAt(j).Value;
                            returnDto.Add(mappedProfile);
                        }
                    }                    
                }
                
                var userOppositeGender = user.Gender == "male" ? "female" : "male"; 
                var returnUserDto = new List<ReturnRecommendDto>();

                for (int i = 0; i < returnDto.Count; i++)
                {
                    if (userOppositeGender == returnDto[i].Gender)
                    {
                        if(returnUserDto.Count() <  50)
                        {
                            returnUserDto.Add(returnDto[i]);
                        }
                        else
                        {
                            break;
                        }
                    }
                }

                return Ok(returnUserDto);
            }
        }

        [HttpGet("searchuser/{id}")]
        public async Task<IActionResult> SearchUser([FromQuery] string searchString)
        {
            var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);

            var user = await repo.SearchUser(currentUserId, searchString);

            if(user == null)
                return BadRequest("Not found...!");

            if(user.Gender == "same gender")
            {
                return BadRequest("Same gender can't be searched..!");
            }

            var usersToReturn = mapper.Map<UserForDetailDto>(user);

            // var userFromRepo = await repo.GetUser(currentUserId);

            
            // if (string.IsNullOrEmpty(userFromRepo.Gender))
            // {
            //     userFromRepo.Gender = userFromRepo.Gender == "male" ? "female" : "male";
            // }
            // Response.AddPagination(users.CurrentPage, users.PageSize, users.TotalCount, users.TotalPages);

            return Ok(usersToReturn);
        }

        // [HttpPost("getRecommendedProfiles")]
        // public IActionResult GetRecommendedProfiles(List<int> ids)
        // {
        //     var recommendedProfiels =  repo.GetRecommendedProfiles(ids);

        //     if(recommendedProfiels == null)
        //         return NoContent();

        //     return Ok(recommendedProfiels);
        // }

    }
}
