using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using OTMS.DAL.Interface;
using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace OTMS.API.Controllers.Student_Endpoint
{
    [Route("api/student/[controller]")]
    [ApiController]
    public class AttendanceController : ControllerBase
    {
        private readonly IMapper _mapper;
        private readonly IAttendanceRepository _attendanceRepository;
        private readonly IClassStudentRepository _classStudentRepository;
        private readonly IAccountRepository _accountRepository;

        public AttendanceController(IMapper mapper, IAttendanceRepository attendanceRepository, IClassStudentRepository classStudentRepository, IAccountRepository accountRepository)
        {
            _mapper = mapper;
            _attendanceRepository = attendanceRepository;
            _classStudentRepository = classStudentRepository;
            _accountRepository = accountRepository;
        }

        [HttpGet("view-class-attendance")]
        public async Task<IActionResult> GetStudentAttendance(Guid classId)
        {
            var userIdClaim = User.FindFirst("uid");;
            if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out Guid studentId))
                return Unauthorized("Invalid student authentication.");

            if (!_classStudentRepository.checkStuentInClass(studentId, classId))
                return Forbid("You are not enrolled in this class.");

            var attendanceRecords = await _attendanceRepository.GetByStudentAndClassAsync(studentId, classId);
            if (attendanceRecords == null || !attendanceRecords.Any())
                return NotFound("No attendance records found for this class.");

            return Ok(new { attendanceRecords });
        }
    }
}
