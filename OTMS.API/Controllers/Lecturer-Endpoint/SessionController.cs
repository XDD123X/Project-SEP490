using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using OTMS.BLL.DTOs;
using OTMS.DAL.Interface;

namespace OTMS.API.Controllers.Lecturer_Endpoint
{
    [Route("api/Lecturer/[controller]")]
    [ApiController]
    public class SessionController : ControllerBase
    {
        private readonly ISessionRepository _sessionRepository;
        private readonly IMapper _mapper;

        public SessionController(IMapper mapper, ISessionRepository sessionRepository)
        {
            _sessionRepository = sessionRepository;
            _mapper = mapper;
        }

        [HttpGet("class/{classId}")]
        public async Task<IActionResult> GetSessionsByClassId(Guid classId)
        {
            var sessions = await _sessionRepository.GetSessionsByClassId(classId);
            if (sessions == null) return NotFound();
            var mappedSessions = _mapper.Map<List<SessionDTO>>(sessions);
            return Ok(mappedSessions);
        }
    }
}
