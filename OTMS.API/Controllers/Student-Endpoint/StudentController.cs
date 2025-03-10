using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using OTMS.DAL.Interface;

namespace OTMS.API.Controllers.Student_Endpoint
{
    [Route("api/[controller]")]
    [ApiController]
    public class StudentController : ControllerBase
    {
        private readonly IMapper _mapper;
        private readonly IScheduleRepository _scheduleRepository;
        public StudentController(IMapper mapper, IScheduleRepository scheduleRepository)
        {
            _mapper = mapper;
            _scheduleRepository = scheduleRepository;
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

    }
}
