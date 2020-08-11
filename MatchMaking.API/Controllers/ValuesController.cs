using System.Linq;
using System.Threading.Tasks;
using MatchMaking.API.Data;
using MatchMaking.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MatchMaking.API.Controllers
{
    [ApiController]
    [Route("[controller]")]

    public class ValuesController : ControllerBase
    {
        private readonly DataContext context;
        public ValuesController(DataContext context)
        {
            this.context = context;
        }

        [HttpGet("getvalues")]
        public async Task<IActionResult> GetVals()
        {
            var data = await context.Value.ToListAsync();

            return Ok(data);
        }

        [HttpGet("getvalue/{id}")] 
        public async Task<IActionResult> GetSingleValue(int id)
        {
            var data = await context.Value.FirstOrDefaultAsync(x => x.Id == id) ?? null;

            return Ok(data);
        }
    }
}