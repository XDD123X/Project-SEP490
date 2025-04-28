using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using OTMS.BLL.DTOs;
using OTMS.BLL.Services;
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
        private readonly IParentRepository _parentRepository;

        public AttendanceController(IMapper mapper, ISessionRepository sessionRepository, IAccountRepository accountRepository, IAttendanceRepository attendanceRepository, IParentRepository parentRepository)
        {
            _mapper = mapper;
            _sessionRepository = sessionRepository;
            _accountRepository = accountRepository;
            _attendanceRepository = attendanceRepository;
            _parentRepository = parentRepository;
        }

        [HttpPost("add")]
        public async Task<IActionResult> TakeAttendance(Guid sessionId, [FromBody] List<AttendanceDTO> students)
        {
            if (students == null || students.Count == 0)
                return BadRequest("Student attendance list is required.");

            var session = await _sessionRepository.GetByIdAsync(sessionId);
            if (session == null)
                return NotFound("Session not found.");

            var userIdClaim = User.FindFirst("uid");
            if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out Guid lecturerId))
                return Unauthorized("Invalid lecturer authentication.");

            if (session.LecturerId != lecturerId)
                return Forbid("You are not authorized to take attendance for this session.");

            if ((DateTime.Now - session.SessionDate).TotalDays > 1)
                return BadRequest("Attendance can only be taken within 1 day of the session.");

            await _attendanceRepository.AddAttendance(sessionId, students);

            foreach (var student in students)
            {
                if (student.Status == 0)
                {
                    bool isExceeded = await _attendanceRepository.CheckAbsentAttendance(student.StudentId, session.ClassId);
                    if (isExceeded)
                    {
                        var studentAccount = await _accountRepository.GetByIdAsync(student.StudentId);
                        if (studentAccount != null)
                        {
                            string studentEmail = studentAccount.Email;
                            string studentSubject = "Cảnh báo: Bạn đã vắng mặt quá 20% số buổi học!";
                            string studentMessage = $@"
Chào {studentAccount.FullName},

Bạn đã vắng mặt quá số buổi quy định trong lớp {session.Class.ClassName}.
Vui lòng liên hệ giáo viên để tránh ảnh hưởng đến kết quả học tập.

Trân trọng,
Phong Linh Class Center
";
                            EmailBackgroundService.EnqueueEmail(studentEmail, studentSubject, studentMessage);
                        }

                        // Gửi email cho phụ huynh nếu có
                        var parents = await _parentRepository.GetParentsByStudentIdAsync(student.StudentId);
                        foreach (var parent in parents)
                        {
                            string parentEmail = parent.Email;
                            string parentSubject = $"Cảnh báo: {studentAccount.FullName} đã vắng mặt 20% quá số buổi học!";
                            string parentMessage = $@"
Kính gửi {parent.FullName},

Chúng tôi xin thông báo rằng con của quý vị, {studentAccount.FullName}, 
đã vắng mặt quá số buổi quy định trong lớp {session.Class.ClassName}. 
Vui lòng theo dõi và nhắc nhở con để đảm bảo việc học không bị gián đoạn.

Trân trọng,
Phong Linh Class Center
";
                            EmailBackgroundService.EnqueueEmail(parentEmail, parentSubject, parentMessage);
                        }
                    }
                }
            }

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

            if (DateTime.Now > session.SessionDate.AddDays(1))
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
