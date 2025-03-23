using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using OTMS.BLL.DTOs;
using OTMS.DAL.Interface;

namespace OTMS.API.Controllers.Lecturer_Endpoint
{
    [Route("api/Lecturer/[controller]")]
    [ApiController]
    public class ClassController : ControllerBase
    {
        private readonly IClassRepository _classRepository;
        private readonly IMapper _mapper;

        public ClassController(IClassRepository classRepository, IMapper mapper)
        {
            _classRepository = classRepository;
            _mapper = mapper;
        }


        [HttpGet("all")]
        [Authorize]
        public async Task<IActionResult> GetClassList()
        {
            var lecturerId = User.FindFirst("uid")?.Value;
            if (lecturerId == null) return BadRequest();

            var classes = await _classRepository.getClassByLecturer(Guid.Parse(lecturerId));
            if (classes == null) return NotFound();

            var response = _mapper.Map<List<ClassDTO>>(classes);

            return Ok(response);
        }

        [HttpGet("{classId}")]
        public async Task<IActionResult> GetClassById(Guid classId)
        {
            var classList = await _classRepository.GetClassList();

            var classEntity = classList.FirstOrDefault(c => c.ClassId == classId);

            if (classEntity == null) return NotFound("Class not found.");

            var response = _mapper.Map<ClassDTO>(classEntity);

            return Ok(response);
        }

    }
}
