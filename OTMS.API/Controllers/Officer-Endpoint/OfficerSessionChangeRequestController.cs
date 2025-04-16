﻿using Microsoft.AspNetCore.Mvc;
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
        private readonly IClassStudentRepository _classStudentRepository;
        private readonly IAccountRepository _accountRepository;
        private readonly INotificationRepository _notificationRepository;

        public OfficerSessionChangeRequestController(
            ISessionChangeRequestRepository sessionChangeRequestRepository,
            IEmailService emailService,
            IClassStudentRepository classStudentRepository,
            IAccountRepository accountRepository,
            INotificationRepository notificationRepository)
        {
            _sessionChangeRequestRepository = sessionChangeRequestRepository;
            _emailService = emailService;
            _classStudentRepository = classStudentRepository;
            _accountRepository = accountRepository;
            _notificationRepository = notificationRepository;
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
            
            if (!IsValidRequest(model, out string errorMessage))
            {
                return BadRequest(new { success = false, message = errorMessage });
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
                    <p>Lý do: {model.Description ?? "Lý do vui lòng hỏi lại officer"}</p>
                    <p>Trân trọng,</p>
                    <p>Future Me Center</p>
                ";

                await _emailService.SendEmailAsync(request.Lecturer.Email, emailSubject, emailBody);
                
                // Gửi thông báo cho giảng viên
                if (request.Lecturer.AccountId != Guid.Empty)
                {
                    var notificationTitle = $"Thông báo về yêu cầu thay đổi lịch học";
                    var notificationContent = $"Yêu cầu thay đổi lịch học của bạn cho buổi học ngày {request.OldDate} (Slot {request.OldSlot}) sang ngày {request.NewDate} (Slot {request.NewSlot}) {statusText}.";
                    
                    var lecturerNotification = new Notification
                    {
                        Title = notificationTitle,
                        Content = notificationContent,
                        CreatedBy = User.FindFirst("uid") != null ? Guid.Parse(User.FindFirst("uid").Value) : Guid.Empty,
                        CreatedAt = DateTime.Now,
                        Type = 2 // Thông báo cho tài khoản cụ thể
                    };
                    
                    await _notificationRepository.AddAsync(lecturerNotification);
                    await _notificationRepository.AssignToAccountsAsync(lecturerNotification.NotificationId, new List<Guid> { request.Lecturer.AccountId });
                }
            }

            //  gửi email thông báo cho tất cả sinh viên trong lớp
            if (model.Status == 1 && request.Session != null)
            {
               
                var classId = request.Session.ClassId;
                
                // Lấy danh sách stdentid
                var classStudents = await _classStudentRepository.GetByClassIdAsync(classId);
                
                if (classStudents.Any())
                {
                    // Lấy danh sách sv trong lớp
                    var studentIds = classStudents.Select(cs => cs.StudentId).ToList();
                    
                    // Tạo thông báo chung cho sv
                    var notificationTitle = $"Thông báo về thay đổi lịch học lớp {request.Session.Class?.ClassName}";
                    var notificationContent = $"Lịch học lớp {request.Session.Class?.ClassName} đã được thay đổi từ ngày {request.OldDate} (Slot {request.OldSlot}) thành ngày {request.NewDate} (Slot {request.NewSlot}). Lý do: {model.Description ?? "Liên hệ giảng viên hoặc trung tâm để biết thêm chi tiết."}";
                    
                    var studentNotification = new Notification
                    {
                        Title = notificationTitle,
                        Content = notificationContent,
                        CreatedBy = User.FindFirst("uid") != null ? Guid.Parse(User.FindFirst("uid").Value) : Guid.Empty,
                        CreatedAt = DateTime.Now,
                        Type = 2 // Thông báo cho tài khoản cụ thể
                    };
                    
                    await _notificationRepository.AddAsync(studentNotification);
                    await _notificationRepository.AssignToAccountsAsync(studentNotification.NotificationId, studentIds);
                    
                    foreach (var studentId in studentIds)
                    {
                        // Lấy thông tin svien
                        var student = await _accountRepository.GetByIdAsync(studentId);
                        
                        if (student != null && !string.IsNullOrEmpty(student.Email))
                        {
                            // Tạo email thông báo cho sinh viên
                            string emailSubject = $"Thông báo về thay đổi lịch học lớp {request.Session.Class?.ClassName}";
                            string emailBody = $@"
                                <h3>Kính gửi {student.FullName},</h3>
                                <p>Lịch học lớp <strong>{request.Session.Class?.ClassName}</strong> đã được thay đổi:</p>
                                <p>- Từ: Ngày {request.OldDate} (Slot {request.OldSlot})</p>
                                <p>- Thành: Ngày {request.NewDate} (Slot {request.NewSlot})</p>
                                <p>Lý do: {model.Description ?? "Để biết thêm chi tiết, vui lòng liên hệ giảng viên hoặc trung tâm."}</p>
                                <p>Xin lưu ý điều chỉnh lịch học của bạn cho phù hợp.</p>
                                <p>Trân trọng,</p>
                                <p>Future Me Center</p>
                            ";
                            
                            await _emailService.SendEmailAsync(student.Email, emailSubject, emailBody);
                        }
                    }
                }
            }

            return Ok(new { success = true, message });
        }

        /// <summary>
        /// Lấy thông tin yêu cầu thay đổi lịch học theo ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<SessionChangeRequest>> GetRequestById(Guid id)
        {
            if (id == Guid.Empty)
            {
                return BadRequest(new { success = false, message = "ID yêu cầu không hợp lệ." });
            }
            
            var request = await _sessionChangeRequestRepository.GetRequestByIdAsync(id);
            if (request == null)
            {
                return NotFound(new { success = false, message = "Không tìm thấy yêu cầu thay đổi lịch học." });
            }
            return Ok(new { success = true, data = request });
        }

        private bool IsValidRequest(UpdateSessionChangeRequestDTO model, out string errorMessage)
        {
            errorMessage = string.Empty;
            
            if (model == null)
            {
                errorMessage = "Dữ liệu cập nhật không được để trống.";
                return false;
            }
            
            if (string.IsNullOrWhiteSpace(model.Description) && model.Status == 2)
            {
                errorMessage = "Vui lòng cung cấp lý do từ chối yêu cầu.";
                return false;
            }
            
            if (model.Status < 0 || model.Status > 2)
            {
                errorMessage = "Trạng thái cập nhật không hợp lệ. Chỉ chấp nhận các giá trị: 0 (Đang xử lý), 1 (Đã duyệt), 2 (Đã từ chối).";
                return false;
            }
            
            return true;
        }
    }
}
