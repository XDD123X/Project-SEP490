using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using OTMS.DAL.Interface;

namespace OTMS.API.Controllers.Student_Endpoint
{
    [Route("api/[controller]")]
    [ApiController]
    public class AttendanceController : ControllerBase
    {
        private readonly IMapper _mapper;
        private readonly IAttendanceRepository _attendanceRepository;

        public AttendanceController(IMapper mapper, IAttendanceRepository attendanceRepository)
        {
            _mapper = mapper;
            _attendanceRepository = attendanceRepository;
        }

        [HttpGet("student-attendance")]
        public async Task<IActionResult> GetStudentAttendance(Guid studentId, Guid classId)
        {
            var attendance = await _attendanceRepository.GetByStudentAndClassAsync(studentId, classId);
            return Ok(attendance);
        }
    }
}
