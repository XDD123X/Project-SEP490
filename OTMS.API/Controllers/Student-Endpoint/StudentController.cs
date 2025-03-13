using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
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
        public StudentController(IMapper mapper, IScheduleRepository scheduleRepository, IAttendanceRepository attendanceRepository)
        {
            _mapper = mapper;
            _scheduleRepository = scheduleRepository;
            _attendanceRepository = attendanceRepository;
            _classStudentRepository = classStudentRepository;
        }

        [HttpGet("student-schedule")]
        public async Task<IActionResult> GetStudentSchedule(Guid id)
        {
            var studentSchedule = await _scheduleRepository.GetByStudentIdAsync(id);
            return Ok(studentSchedule);
        }
        [HttpGet("student-attendance")]
        public async Task<IActionResult> GetStudentAttendance(Guid studentId, Guid classId)
        {
            var attendance = await _attendanceRepository.GetByStudentAndClassAsync(studentId, classId);
            return Ok(attendance);
        }
        [HttpGet("student-class")]
        public async Task<IActionResult> GetStudentClass(Guid studentId)
        {
            var c = await _classRepository.getClassByStudent(studentId);
            return Ok(c);
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
