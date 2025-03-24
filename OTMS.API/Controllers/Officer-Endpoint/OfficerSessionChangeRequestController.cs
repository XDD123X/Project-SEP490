using Microsoft.AspNetCore.Mvc;
using OTMS.API.Controllers.Officer_Endpoint;
using OTMS.BLL.DTOs;
using OTMS.BLL.Models;
using OTMS.DAL.Interface;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace OTMS.API.Controllers.Officer_Endpoint
{
    [Route("api/officer/session-change")]
    [ApiController]
    public class OfficerSessionChangeRequestController : ControllerBase
    {
        private readonly ISessionChangeRequestRepository _sessionChangeRequestRepository;
        private readonly IEmailService _emailService;

        public OfficerSessionChangeRequestController(
            ISessionChangeRequestRepository sessionChangeRequestRepository,
            IEmailService emailService)
        {
            _sessionChangeRequestRepository = sessionChangeRequestRepository;
            _emailService = emailService;
        }

        /// <summary>
        /// Lấy tất cả yêu cầu thay đổi lịch học
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<SessionChangeRequest>>> GetAllRequests()
        {
            var requests = await _sessionChangeRequestRepository.GetAllRequestsAsync();
            return Ok(new { success = true, data = requests });
        }

        /// <summary>
        /// Lấy các yêu cầu thay đổi lịch học đang chờ duyệt
        /// </summary>
        [HttpGet("pending")]
        public async Task<ActionResult<IEnumerable<SessionChangeRequest>>> GetPendingRequests()
        {
            var requests = await _sessionChangeRequestRepository.GetPendingRequestsAsync();
            return Ok(new { success = true, data = requests });
        }

        /// <summary>
        /// Duyệt hoặc từ chối yêu cầu thay đổi lịch học
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateRequest(Guid id, [FromBody] UpdateSessionChangeRequestDTO model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            model.RequestChangeId = id;

            var request = await _sessionChangeRequestRepository.GetRequestByIdAsync(id);
            if (request == null)
            {
                return NotFound(new { success = false, message = "Không tìm thấy yêu cầu thay đổi lịch học." });
            }

            var (isSuccess, message) = await _sessionChangeRequestRepository.UpdateRequestAsync(model);
            if (!isSuccess)
            {
                return BadRequest(new { success = false, message });
            }

            // Gửi email thông báo cho giảng viên
            if (request.Lecturer?.Email != null)
            {
                string statusText = model.Status switch
                {
                    1 => "đã được duyệt",
                    2 => "đã bị từ chối",
                    _ => "đã được cập nhật"
                };

                string emailSubject = $"Thông báo về yêu cầu thay đổi lịch học";
                string emailBody = $@"
                    <h3>Kính gửi {request.Lecturer.FullName},</h3>
                    <p>Yêu cầu thay đổi lịch học của bạn cho buổi học ngày {request.OldDate} (Slot {request.OldSlot}) sang ngày {request.NewDate} (Slot {request.NewSlot}) {statusText}.</p>
                    <p>Lý do: {model.Description ?? "Lý do thì hỏi lại officer"}</p>
                    <p>Trân trọng,</p>
                    <p>Future Me Center</p>
                ";

                await _emailService.SendEmailAsync(request.Lecturer.Email, emailSubject, emailBody);
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
    }
}
