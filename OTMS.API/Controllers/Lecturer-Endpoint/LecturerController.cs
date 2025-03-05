using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using OTMS.BLL.DTOs;
using OTMS.BLL.Models;
using OTMS.DAL.Interface;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace OTMS.API.Controllers.Lecturer_Endpoint
{
    [Route("api/[controller]")]
    [ApiController]
    public class LecturerController : ControllerBase
    {
        private readonly IMapper _mapper;
        private readonly IScheduleRepository _scheduleRepository;
        private readonly IAccountRepository _accountRepository;
        private readonly IClassRepository _classRepository;
        private readonly IClassStudentRepository _classStudentRepository;
        private readonly IAttendanceRepository _attendanceRepository;

        public LecturerController(
            IMapper mapper,
            IScheduleRepository scheduleRepository,
            IAccountRepository accountRepository,
            IClassRepository classRepository,
            IClassStudentRepository classStudentRepository,
            IAttendanceRepository attendanceRepository)
        {
            _mapper = mapper;
            _scheduleRepository = scheduleRepository;
            _accountRepository = accountRepository;
            _classRepository = classRepository;
            _classStudentRepository = classStudentRepository;
            _attendanceRepository = attendanceRepository;
        }

        [HttpGet("lecturer-schedule")]
        public async Task<IActionResult> GetLecturerSchedule(Guid lecturerId)
        {
            var lecturerSchedule = await _scheduleRepository.GetByLecturerIdAsync(lecturerId);
            if (lecturerSchedule == null)
                return NotFound("Lecturer schedule not found.");
            
            return Ok(new { lecturerSchedule });
        }

        [HttpPost("take-attendance")]
        public async Task<IActionResult> TakeAttendance(Guid sessionId, [FromBody] List<AttendanceDTO> students)
        {
            if (students == null || students.Count == 0)
                return BadRequest("Student attendance list is required.");

            await _attendanceRepository.TakeListAttendance(sessionId, students);
            return Ok("Attendance taken successfully.");
        }

        [HttpPut("edit-attendance")]
        public async Task<IActionResult> EditAttendance(Guid sessionId, [FromBody] List<AttendanceDTO> students)
        {
            if (students == null || students.Count == 0)
                return BadRequest("Student attendance list is required.");

            await _attendanceRepository.EditAttendance(sessionId, students);
            return Ok("Attendance updated successfully.");
        }

        [HttpGet("get-student-by-session")]
        public async Task<IActionResult> GetStudentBySession(Guid sessionId)
        {
            var session = await _scheduleRepository.GetByIdAsync(sessionId);
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