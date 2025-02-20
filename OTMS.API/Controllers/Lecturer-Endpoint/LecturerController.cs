using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using OTMS.DAL.Interface;

namespace OTMS.API.Controllers.Lecturer_Endpoint
{
    [Route("api/[controller]")]
    [ApiController]
    public class LecturerController : ControllerBase
    {
        private readonly IMapper _mapper;
        private readonly IScheduleRepository _scheduleRepository;
        public LecturerController(IMapper mapper, IScheduleRepository scheduleRepository)
        {
            _mapper = mapper;
            _scheduleRepository = scheduleRepository;
        }
        [HttpGet("lecturer-schedule")]
        public async Task<IActionResult> GetLecturerSchedule(Guid id)
        {
            var lecturerSchedule = await _scheduleRepository.GetByLecturerIdAsync(id);
            return Ok(new
            {
                lecturerSchedule
            });
        }
    }
}
