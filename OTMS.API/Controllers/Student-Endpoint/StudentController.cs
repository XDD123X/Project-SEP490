using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using OTMS.BLL.Models;
using OTMS.DAL.Interface;

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
        [HttpGet("student-class")]
        public async Task<IActionResult> GetStudentClass(Guid studentId)
        {
            var c = _classRepository.getClassByStudent(studentId);
            return Ok(c);
        }
    }
}
