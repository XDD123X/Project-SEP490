using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OTMS.BLL.Models;

namespace OTMS.API.Controllers.Auth
{
    [Route("api/[controller]")]
    [ApiController]
    public class ATestController : ControllerBase
    {
        private readonly OtmsContext _otmsContext;

        public ATestController(OtmsContext otmsContext)
        {
            _otmsContext = otmsContext;
        }

        [HttpGet("1")]
        public async Task<IActionResult> GetFirst(string courseName)
        {
            var result = await _otmsContext.Courses
                .Where(c => c.CourseName.ToLower() == courseName.ToLower())
                .SelectMany(c => c.Classes.SelectMany(cl => cl.ClassStudents.Select(cs => cs.Student.AccountId)))
                .ToListAsync();

            return Ok(result);
        }
    }
}
