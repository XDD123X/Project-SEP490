using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using OTMS.BLL.DTOs;
using OTMS.DAL.Interface;
using OTMS.DAL.Repository;

namespace OTMS.API.Controllers.Lecturer_Endpoint.Policy
{
    [Route("api/Lecturer/[controller]")]
    [ApiController]
    public class SessionController : ControllerBase
    {
        private readonly ISessionRepository _sessionRepository;
        private readonly IScheduleRepository _scheduleRepository;
        private readonly IMapper _mapper;

        public SessionController(IScheduleRepository scheduleRepository ,ISessionRepository sessionRepository, IMapper mapper)
        {
            _mapper = mapper;
            _sessionRepository = sessionRepository;
            _scheduleRepository = scheduleRepository;
        }

        [HttpGet("lecturer-schedule/{id}")]
        public async Task<IActionResult> GetLecturerSchedule(Guid id)
        {
            var lecturerSchedule = await _scheduleRepository.GetByLecturerIdAsync(id);
            var response = _mapper.Map<List<SessionDTO>>(lecturerSchedule);
            return Ok(response);
        }

    }
}
