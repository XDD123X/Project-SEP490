﻿using Microsoft.AspNetCore.Http;
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

        public SessionController(ISessionRepository sessionRepository)
        {
            _sessionRepository = sessionRepository;
        }

        [HttpPost("generate-schedule")]
        public async Task<IActionResult> GenerateSchedule([FromBody] ClassScheduleRequest request)
        {
            try
            {
                var sessions = await _sessionRepository.GenerateAndSaveScheduleAsync(request);

                return Ok(new
                {
                    Success = true,
                    Message = "Lập lịch thành công",
                    Data = sessions.Select(s => new
                    {
                        s.SessionId,
                        s.ClassId,
                        s.LecturerId,
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
    }
}
