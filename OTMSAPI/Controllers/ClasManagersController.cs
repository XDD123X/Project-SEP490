using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using OTMS_DLA.Interface;
using OTMSAPI.Repositories;

namespace OTMSAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ClasManagersController : ControllerBase
    {
        private readonly IClassRepository _classRepository;
        private readonly IClassStudentRepository _classStudentRepository;
        public ClasManagersController(IClassRepository classRepository, IClassStudentRepository classStudentRepository)
        {
            _classRepository = classRepository;
            _classStudentRepository = classStudentRepository;
        }
        [HttpGet("class-list")]
        public async Task<IActionResult> GetClass(
           [FromQuery] int page = 1,
           [FromQuery] int pageSize = 10,
           [FromQuery] string? search = null,
           [FromQuery] string sortBy = "classCode",
           [FromQuery] string sortOrder = "desc")
        {
            _classRepository.
            return Ok(new
            {
                TotalClass = totalClass,
                Page = page,
                PageSize = pageSize,
                Class = class
            });
        }
    }
}
