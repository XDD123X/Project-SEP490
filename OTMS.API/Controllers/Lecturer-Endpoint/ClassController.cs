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
        private readonly IClassStudentRepository _classStudentRepository;
        private readonly IAccountRepository _accountRepository;
        private readonly IMapper _mapper;

        public ClassController(IClassRepository classRepository, IClassStudentRepository classStudentRepository, IAccountRepository accountRepository, IMapper mapper)
        {
            _classRepository = classRepository;
            _classStudentRepository = classStudentRepository;
            _accountRepository = accountRepository;
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

        [HttpPost("report/{classId}/{studentId}")]
        public async Task<IActionResult> ReportStudent(Guid classId, Guid studentId)
        {


            var student = await _accountRepository.GetByIdAsync(studentId);
            if (student == null) return NotFound();

            var classStudent = await _classStudentRepository.GetByClassAndStudentAsync(classId, studentId);
            if (classStudent == null) return NotFound();

            classStudent.Status = 1 - classStudent.Status;
            await _classStudentRepository.UpdateAsync(classStudent);
            return Ok(studentId + "Change Status In Class To Successfully");

        }
    }
}
