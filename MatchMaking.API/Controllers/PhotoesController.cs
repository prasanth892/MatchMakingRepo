using Microsoft.AspNetCore.Mvc;
using AutoMapper;
using MatchMaking.API.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Options;
using MatchMaking.API.Helpers;
using CloudinaryDotNet;
using System.Threading.Tasks;
using MatchMaking.API.Dtos;
using System.Security.Claims;
using CloudinaryDotNet.Actions;
using MatchMaking.API.Models;
using System.Linq;

namespace MatchMaking.API.Controllers
{
    [Authorize]
    [Route("users/{userid}/photoes")]
    [ApiController]
    public class PhotoesController : ControllerBase
    {
        private readonly IMatchMakingRepository repo;
        private readonly IMapper mapper;
        private readonly IOptions<CloudinarySettings> cloudinaryConfig;

        private Cloudinary cloudinary;
        public PhotoesController(IMatchMakingRepository repo, IMapper mapper,
        IOptions<CloudinarySettings> cloudinaryConfig)
        {
            this.cloudinaryConfig = cloudinaryConfig;
            this.mapper = mapper;
            this.repo = repo;

            Account acc = new Account(
              cloudinaryConfig.Value.CloudName,
              cloudinaryConfig.Value.ApiKey,
              cloudinaryConfig.Value.ApiSecret
            );

            cloudinary = new Cloudinary(acc);
        }

        [HttpGet("/{id}", Name = "GetPhoto")]
        public async Task<IActionResult> GetPhoto(int id)
        {
            var photoFromRepo = await repo.GetPhoto(id);

            var photo = mapper.Map<PhotoForReturnDto>(photoFromRepo);

            return Ok(photo);
        }

        [HttpPost]
        public async Task<IActionResult> AddPhotoForUser(int userId, [FromForm]PhotoForCreationDto photoForCreationDto)
        {
            if (userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
                return Unauthorized();

            var userToUpdate = await repo.GetUser(userId);

            var file = photoForCreationDto.File;

            var uploadResult = new ImageUploadResult();

            if (file.Length > 0)
            {
                using (var stream = file.OpenReadStream())
                {
                    var uploadParams = new ImageUploadParams()
                    {
                        File = new FileDescription(file.Name, stream),
                        Transformation = new Transformation().Width(500).Height(500).Crop("fill").Gravity("face")
                    };

                    uploadResult = cloudinary.Upload(uploadParams);
                }
            }

            photoForCreationDto.Url = uploadResult.Uri.ToString();
            photoForCreationDto.PublicId = uploadResult.PublicId;

            var photo = mapper.Map<Photo>(photoForCreationDto);

            if (!userToUpdate.Photos.Any(u => u.IsMain))
                photo.IsMain = true;

            userToUpdate.Photos.Add(photo);

            if (await repo.SaveAll())
            {
                var photoToReturn = mapper.Map<PhotoForReturnDto>(photo);
                return CreatedAtRoute("GetPhoto", new { id = photo.Id }, photoToReturn);
            }

            return BadRequest("Could not add the photo!");
        }


        // Set the main photo
        [HttpPost("{id}/setMain")]
        public async Task<IActionResult> SetMainPhoto(int userId, int id)
        {
            // Check the current user sending the request for changes.
            if (userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))

                return Unauthorized();

            var user = await repo.GetUser(userId);

            if (!user.Photos.Any(p => p.Id == id))
                return Unauthorized();


            var photoFromRepo = await repo.GetPhoto(id);

            if (photoFromRepo.IsMain)
                return BadRequest("this is already the main photo");

            var currentMainPhoto = await repo.GetMainPhotoForUser(userId);
            currentMainPhoto.IsMain = false;

            photoFromRepo.IsMain = true;

            if (await repo.SaveAll())
                return NoContent();

            return BadRequest("Could not set photo to main..!");
        }

       [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePhoto(int userId, int id)
        {
            // Check the current user sending the request for changes.
            if (userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
                return Unauthorized();

            var user = await repo.GetUser(userId);

            if (!user.Photos.Any(p => p.Id == id))
                return Unauthorized();

            var photoFromRepo = await repo.GetPhoto(id);

            if (photoFromRepo.IsMain)
                return BadRequest("You can't delete your main photo");


            if (photoFromRepo.PublicId != null)
            {
                var deleteParam = new DeletionParams(photoFromRepo.PublicId);

                var result = cloudinary.Destroy(deleteParam);

                if (result.Result == "ok")
                {
                    repo.Delete(photoFromRepo);
                }
            }

            if (photoFromRepo.PublicId is null)
            {
                repo.Delete(photoFromRepo);
            }

            if (await repo.SaveAll())
                return Ok();

            return BadRequest("Failed to delete the photo");
        }
    }



}