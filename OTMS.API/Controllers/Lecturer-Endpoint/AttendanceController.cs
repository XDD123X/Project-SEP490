using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using OTMS.BLL.DTOs;
using OTMS.DAL.Interface;
using OTMS.DAL.Repository;
using System.Security.Claims;

namespace OTMS.API.Controllers.Lecturer_Endpoint
{
    [Route("api/Lecturer/[controller]")]
    [ApiController]
    public class AttendanceController : ControllerBase
    {
        private readonly IMapper _mapper;
        private readonly ISessionRepository _sessionRepository;
        private readonly IAccountRepository _accountRepository;
        private readonly IAttendanceRepository _attendanceRepository;

        public AttendanceController(
            IMapper mapper,
            ISessionRepository sessionRepository,
            IAccountRepository accountRepository,
            IClassRepository classRepository,
            IClassStudentRepository classStudentRepository,
            IAttendanceRepository attendanceRepository)
        {
            _mapper = mapper;
            _sessionRepository = sessionRepository;
            _accountRepository = accountRepository;
            _attendanceRepository = attendanceRepository;
        }
        [HttpPost("add")]
        public async Task<IActionResult> TakeAttendance(Guid sessionId, [FromBody] List<AttendanceDTO> students)
        {
            if (students == null || students.Count == 0)
                return BadRequest("Student attendance list is required.");

            var session = await _sessionRepository.GetByIdAsync(sessionId);
            if (session == null) return NotFound("Session not found.");

            await _attendanceRepository.AddAttendance(sessionId, students);

            session.Status = 2;
            await _sessionRepository.UpdateAsync(session);

            return Ok("Attendance taken successfully.");
        }


        [HttpPut("edit/{sessionId}")]
        public async Task<IActionResult> EditAttendance(Guid sessionId, [FromBody] List<AttendanceDTO> students)
        {
            if (students == null || students.Count == 0)
                return BadRequest("Student attendance list is required.");

            var userIdClaim = User.FindFirst("uid")?.Value;
            if (userIdClaim == null || !Guid.TryParse(userIdClaim, out Guid lecturerId))
                return Unauthorized("Invalid lecturer authentication.");

            var session = await _sessionRepository.GetByIdAsync(sessionId);
            if (session == null)
                return NotFound("Session not found.");

            if (session.LecturerId != lecturerId)
                return Forbid("You are not authorized to edit attendance for this session.");

            if (DateTime.UtcNow > session.SessionDate.AddDays(1))
                return BadRequest("Attendance cannot be edited more than 1 day after the session.");

            var classStudents = await _accountRepository.GetByStudentByClass(session.ClassId);
            var classStudentIds = classStudents.Select(s => s.AccountId).ToHashSet();

            foreach (var student in students)
            {
                if (!classStudentIds.Contains(student.StudentId))
                    return BadRequest($"Student {student.StudentId} is not in this class.");
            }
            await _attendanceRepository.EditAttendance(sessionId, students);

            return Ok("Attendance updated successfully.");
        }


        [HttpGet("get-student-by-session")]
        public async Task<IActionResult> GetStudentBySession(Guid sessionId)
        {
            var session = await _sessionRepository.GetByIdAsync(sessionId);
            if (session == null)
                return NotFound("Session not found.");

            var students = await _accountRepository.GetByStudentByClass(session.ClassId);
            return Ok(new { students });
        }

        [HttpGet("get-attendance-by-session")]
        public async Task<IActionResult> GetAttendanceBySession(Guid sessionId)
        {
            var attendanceList = await _attendanceRepository.GetBySessionAsync(sessionId);
            if (attendanceList == null || attendanceList.Count == 0)
                return NotFound("No attendance records found for this session.");
            return Ok(new { attendanceList });
        }
    }
}
