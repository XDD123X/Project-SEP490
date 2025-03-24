using Microsoft.AspNetCore.Mvc;
using OTMS.BLL.DTOs;
using OTMS.BLL.Models;
using OTMS.DAL.Interface;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace OTMS.API.Controllers.Lecturer_Endpoint
{
    [Route("api/lecturer/session-change")]
    [ApiController]
    public class LecturerSessionChangeRequestController : ControllerBase
    {
        private readonly ISessionChangeRequestRepository _sessionChangeRequestRepository;
        private readonly ISessionRepository _sessionRepository;

        public LecturerSessionChangeRequestController(
            ISessionChangeRequestRepository sessionChangeRequestRepository,
            ISessionRepository sessionRepository)
        {
            _sessionChangeRequestRepository = sessionChangeRequestRepository;
            _sessionRepository = sessionRepository;
        }

        /// <summary>
        /// Gửi yêu cầu thay đổi lịch học
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> SubmitRequest([FromBody] AddSessionChangeRequestDTO model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var (isSuccess, message) = await _sessionChangeRequestRepository.AddRequestAsync(model);
            if (!isSuccess)
            {
                return BadRequest(new { success = false, message });
            }

            return Ok(new { success = true, message });
        }

        /// <summary>
        /// Lấy thông tin yêu cầu thay đổi lịch học theo ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<SessionChangeRequest>> GetRequestById(Guid id)
        {
            var request = await _sessionChangeRequestRepository.GetRequestByIdAsync(id);
            if (request == null)
            {
                return NotFound(new { success = false, message = "Không tìm thấy yêu cầu thay đổi lịch học." });
            }
            return Ok(new { success = true, data = request });
        }

        /// <summary>
        /// Lấy danh sách yêu cầu thay đổi lịch học của giảng viên
        /// </summary>
        [HttpGet("lecturer/{lecturerId}")]
        public async Task<ActionResult<IEnumerable<SessionChangeRequest>>> GetRequestsByLecturerId(Guid lecturerId)
        {
            var requests = await _sessionChangeRequestRepository.GetRequestsByLecturerIdAsync(lecturerId);
            return Ok(new { success = true, data = requests });
        }

        /// <summary>
        /// Kiểm tra xem ngày và slot mới có bị trùng lịch không
        /// </summary>
        [HttpGet("check-conflict")]
        public async Task<IActionResult> CheckScheduleConflict([FromQuery] Guid lecturerId, [FromQuery] DateTime newDate, [FromQuery] int newSlot, [FromQuery] Guid? sessionId = null)
        {
            var (isConflict, message) = await _sessionChangeRequestRepository.CheckScheduleConflictAsync(lecturerId, newDate, newSlot, sessionId);
            
            return Ok(new { 
                success = true, 
                hasConflict = isConflict, 
                message = isConflict ? message : "Không có lịch trùng."
            });
        }

        /// <summary>
        /// Kiểm tra thông tin buổi học trước khi gửi yêu cầu thay đổi
        /// </summary>
        [HttpGet("session/{sessionId}")]
        public async Task<IActionResult> GetSessionInfo(Guid sessionId)
        {
            var session = await _sessionRepository.GetByIdAsync(sessionId);
            if (session == null)
            {
                return NotFound(new { success = false, message = "Không tìm thấy buổi học." });
            }

            return Ok(new { 
                success = true, 
                data = new {
                    sessionId = session.SessionId,
                    classId = session.ClassId,
                    className = session.Class?.ClassName,
                    lecturerId = session.LecturerId,
                    currentDate = session.SessionDate,
                    currentSlot = session.Slot
                }
            });
        }
    }
}
