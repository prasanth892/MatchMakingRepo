using System.Linq;
using System.Threading.Tasks;
using MatchMaking.API.Data;
using MatchMaking.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Http;

namespace MatchMaking.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ValuesController : ControllerBase
    {
        private readonly DataContext context;
        public ValuesController(DataContext context)
        {
            this.context = context;
        }

        [AllowAnonymous]
        [HttpGet("getvalues")]
        public async Task<IActionResult> GetVals()
        {
            var data = await context.Value.ToListAsync();

            return Ok(data);
        }

        [AllowAnonymous]
        [HttpGet("getvalue/{id}")]
        public async Task<IActionResult> GetSingleValue(int id)
        {
            var data = await context.Value.FirstOrDefaultAsync(x => x.Id == id);

            return Ok(data);
        }
    }
}