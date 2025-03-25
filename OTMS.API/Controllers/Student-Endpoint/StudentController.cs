using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using OTMS.BLL.DTOs;
using OTMS.BLL.Models;
using OTMS.DAL.Interface;
using OTMS.DAL.Repository;

namespace OTMS.API.Controllers.Student_Endpoint
{
    [Route("api/[controller]")]
    [ApiController]
    public class StudentController : ControllerBase
    {
        private readonly IMapper _mapper;
        private readonly IScheduleRepository _scheduleRepository;
        private readonly IAttendanceRepository _attendanceRepository;
        private readonly IClassRepository _classRepository;
        private readonly IClassStudentRepository _classStudentRepository;
        public StudentController(IMapper mapper, IScheduleRepository scheduleRepository, IAttendanceRepository attendanceRepository,IClassRepository classRepository,  IClassStudentRepository classStudentRepository)
        {
            _mapper = mapper;
            _scheduleRepository = scheduleRepository;
            _attendanceRepository = attendanceRepository;
            _classRepository = classRepository;
            _classStudentRepository = classStudentRepository;
        }

        [HttpGet("student-schedule/{id}")]
        public async Task<IActionResult> GetStudentSchedule(Guid id)
        {
            var studentSchedule = await _scheduleRepository.GetByStudentIdAsync(id);
            var response = _mapper.Map<List<SessionDTO>>(studentSchedule);
            return Ok(response);
        }

        [HttpGet("student-class")]
        public async Task<IActionResult> GetStudentClass(Guid studentId)
        {
            var c = await _classRepository.getClassByStudent(studentId);
            var response = _mapper.Map<List<ClassDTO>>(c);
            return Ok(response);
        }

        [HttpGet("student-enrolled-classes")]
        public async Task<IActionResult> GetStudentEnrolledClasses(Guid studentId)
        {
            var enrolledClasses = await _classStudentRepository.GetListOfClassStudentEnrolled(studentId);

            if (enrolledClasses == null || !enrolledClasses.Any())
            {
                return NotFound("Student is not enrolled in any classes.");
            }

            return Ok(enrolledClasses);
        }

    }
}
