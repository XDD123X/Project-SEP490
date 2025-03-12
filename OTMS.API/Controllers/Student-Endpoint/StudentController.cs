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
        private readonly IClassStudentRepository _classStudentRepository;

        public StudentController(IMapper mapper, IScheduleRepository scheduleRepository, IAttendanceRepository attendanceRepository, IClassStudentRepository classStudentRepository)
        {
            _mapper = mapper;
            _scheduleRepository = scheduleRepository;
            _attendanceRepository = attendanceRepository;
            _classStudentRepository = classStudentRepository;
        }

        [HttpGet("student-schedule")]
        public async Task<IActionResult> GetStudentSchedule(Guid id, DateTime startDate, DateTime endDate)
        {
            if (startDate > endDate)
            {
                return BadRequest("Start date must be before end date.");
            }

            var studentSchedule = await _scheduleRepository.GetByStudentIdAndDateRangeAsync(id, startDate, endDate);

            return Ok(new
            {
                StudentId = id,
                StartDate = startDate,
                EndDate = endDate,
                Sessions = studentSchedule
            });
        }
        [HttpGet("student-attendance")]
        public async Task<IActionResult> GetStudentAttendance(Guid studentId, Guid classId)
        {
            var attendance = _attendanceRepository.GetByStudentAndClassAsync(studentId, classId);
            return Ok(attendance);
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
