using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using OTMS.BLL.DTOs;
using OTMS.DAL.Interface;

namespace OTMS.API.Controllers.Officer_Endpoint
{
    [Route("api/[controller]")]
    [ApiController]
    public class SessionController : ControllerBase
    {
        private readonly ISessionRepository _sessionRepository;
        private readonly IAccountRepository _accountRepository;
        private readonly IClassRepository _classRepository;
        private readonly IMapper _mapper;

        public SessionController(ISessionRepository sessionRepository, IAccountRepository accountRepository, IClassRepository classRepository, IMapper mapper)
        {
            _sessionRepository = sessionRepository;
            _accountRepository = accountRepository;
            _classRepository = classRepository;
            _mapper = mapper;
        }

        [HttpPost("generate-schedule")]
        public async Task<IActionResult> GenerateSchedule([FromBody] ClassScheduleRequest request)
        {
            // Validate request
            if (request.StartDate.Date < DateTime.UtcNow.Date)
                return BadRequest(new { Success = false, Message = "StartDate không được trước thời gian hiện tại." });

            //tạm thời
            request.EndDate = request.EndDate != null ? request.EndDate : request.StartDate.AddYears(1);
            request.TotalSessions = request.TotalSessions != null ? request.TotalSessions : 10;
            request.SlotsPerDay = request.SlotsPerDay != null ? request.SlotsPerDay : 4;


            if (request.StartDate.Date >= request.EndDate.Value.Date)
                return BadRequest(new { Success = false, Message = "StartDate phải trước EndDate." });

            try
            {
                var sessions = await _sessionRepository.GenerateAndSaveScheduleAsync(request);
                var lecturer = await _accountRepository.GetByIdAsync(request.LecturerId);
                var classInfor = await _classRepository.GetByIdAsync(request.ClassId);

                var lecturerMap = _mapper.Map<AccountDTO>(lecturer);
                var classMap = _mapper.Map<ClassDTO>(classInfor);


                return Ok(new
                {
                    Success = true,
                    Message = "Lập lịch thành công",
                    Data = sessions.Select(s => new
                    {
                        s.SessionId,
                        Class = classMap,
                        Lecturer = lecturerMap,
                        s.SessionDate,
                        s.Slot,
                        s.Status
                    })
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    Success = false,
                    Message = ex.Message
                });
            }
        }

        [HttpGet("All")]
        public async Task<IActionResult> GetAllSession()
        {
            var sessions = await _sessionRepository.GetSessionList();
            if (sessions == null || !sessions.Any())
                return NotFound();

            var response = _mapper.Map<List<SessionDTO>>(sessions);
            return Ok(response);
        }

        [HttpPut("Update")]
        public async Task<IActionResult> UpdateSession(SessionUpdateModel update)
        {
            if (update == null || update.SessionId == Guid.Empty)
            {
                return BadRequest("Invalid session data.");
            }
        }

    }
}
