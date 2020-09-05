using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Net.Http;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using MatchMaking.API.Data;
using MatchMaking.API.Dtos;
using MatchMaking.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json;

namespace MatchMaking.API.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthRepository repo;
        private readonly IConfiguration configuration;
        private readonly IMapper mapper;
        public AuthController(IAuthRepository repo, IConfiguration configuration, IMapper mapper)
        {
            this.mapper = mapper;
            this.configuration = configuration;
            this.repo = repo;
        }


        [HttpPost("register")]
        public async Task<IActionResult> Register(UserForRegisterDto userForRegisterDto)
        {
            // validate request

            userForRegisterDto.Username = userForRegisterDto.Username.ToLower();

            if (await repo.UserExists(userForRegisterDto.Username))
                return BadRequest("Username already exists");

            var userToCreate = mapper.Map<User>(userForRegisterDto);

            var createdUser = await repo.Register(userToCreate, userForRegisterDto.Password);

            var userToReturn = mapper.Map<UserForDetailDto>(createdUser);

            return CreatedAtRoute("getuser", new {controller = "user", id = createdUser.Id}, userToReturn);

        
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(UserForLoginDto userForLoginDto)
        {
            var userFromRepo = await repo.Login(userForLoginDto.Username.ToLower(), userForLoginDto.Password);

            if (userFromRepo == null)
                return Unauthorized();

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, userFromRepo.Id.ToString()),
                new Claim(ClaimTypes.Name, userFromRepo.Username)
            };

            // AppSettings is created in Appsetting.json 
            var key = new SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes(configuration.GetSection("AppSettings:Token").Value));

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);

            // Decrypt the token
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.Now.AddDays(1),
                SigningCredentials = creds
            };

            var tokenhandler = new JwtSecurityTokenHandler();

            var token = tokenhandler.CreateToken(tokenDescriptor);

            var user = mapper.Map<UserForListDto>(userFromRepo);

            // Logging testing workin
            // _logger.LogInformation("Index page says hello");


            // Returning an anonymous object with OK Status code
            return Ok(new
            {
                token = tokenhandler.WriteToken(token),
                // userFromRepo.UserType,
                user

            });
        }

    }

}
