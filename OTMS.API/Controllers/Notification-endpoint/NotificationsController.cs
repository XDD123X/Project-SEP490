using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using OTMS.BLL.DTOs;
using OTMS.BLL.Models;
using OTMS.BLL.Services;
using OTMS.DAL.Interface;
using OTMS.DAL.Repository;
using System.Linq;
using System.Security.Claims;

namespace OTMS.API.Controllers.Notification_endpoint
{
    [Route("api/[controller]")]
    [ApiController]
    public class NotificationsController : ControllerBase
    {
        private readonly INotificationRepository _notificationRepository;
        private readonly IRoleRepository _roleRepository;
        private readonly IAccountRepository _accountRepository;
        private readonly ICourseRepository _courseRepository;
        private readonly IClassRepository _classRepository;
        private readonly IMapper _mapper;
        private readonly IEmailService _emailService;
        private readonly NewEmailBackgroundService _emailBackgroundService;

        public NotificationsController( NewEmailBackgroundService emailBackgroundService,INotificationRepository notificationRepository, IRoleRepository roleRepository, IAccountRepository accountRepository, ICourseRepository courseRepository, IClassRepository classRepository, IMapper mapper, IEmailService emailService)
        {
            _notificationRepository = notificationRepository;
            _roleRepository = roleRepository;
            _accountRepository = accountRepository;
            _courseRepository = courseRepository;
            _classRepository = classRepository;
            _mapper = mapper;
            _emailService = emailService;
            _emailBackgroundService = emailBackgroundService;
        }

        [HttpGet("me")]
        public async Task<IActionResult> GetMyNotification()
        {
            try
            {
                //ID
                var uid = User.FindFirst("uid")?.Value;
                if (string.IsNullOrEmpty(uid))
                {
                    return Unauthorized("Invalid token");
                }

                // 2. get acount by id
                var account = await _accountRepository.GetByIdAsync(Guid.Parse(uid));
                if (account == null)
                {
                    return NotFound("Account not found");
                }

                // 3. get role
                var role = account.Role?.Name;
                if (string.IsNullOrEmpty(role))
                {
                    return BadRequest("Role not assigned to account");
                }

                // 4. get common
                var commonNotifications = await _notificationRepository.GetAllCommonNotificationAsync();

                // 5. get by role
                var roleNotifications = await _notificationRepository.GetAllRoleNotificationAsync(role);

                // 6. get by account id
                var privateNotifications = await _notificationRepository.GetAllAccountNotificationAsync(account.AccountId);

                // 7. Merge
                var mergedNotifications = commonNotifications
                    .Union(roleNotifications)
                    .Distinct();

                // 8. Map
                var mappedMergedNotifications = _mapper.Map<List<NotificationDTO>>(mergedNotifications);
                var mappedPrivateNotifications = _mapper.Map<List<NotificationDTO>>(privateNotifications);

                var result = new
                {
                    Common = mappedMergedNotifications ?? new List<NotificationDTO>(),
                    Private = mappedPrivateNotifications ?? new List<NotificationDTO>()
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("list")]
        public async Task<IActionResult> GetNotification([FromBody] Guid accountId)
        {
            var notifications = await _notificationRepository.GetNotificationManagementAsync(accountId);
            var result = _mapper.Map<List<NotificationDTO>>(notifications);
            return Ok(result);
        }


        [HttpGet("{id}")]
        public async Task<IActionResult> GetNotificationById(Guid id)
        {
            var notification = await _notificationRepository.GetByIdAsync(id);
            if (notification == null) return NotFound("Notification not found");
            var result = _mapper.Map<NotificationDTO>(notification);
            return Ok(result);
        }

        [HttpPost("add")]
        public async Task<IActionResult> CreateNotification([FromBody] InputNotificationDTO newNotificationDTO)
        {
            if (!ModelState.IsValid || string.IsNullOrWhiteSpace(newNotificationDTO.Title) || string.IsNullOrWhiteSpace(newNotificationDTO.Content))
                return BadRequest("Title and Content are required.");

            var uid = User.FindFirst("uid")?.Value;
            if (string.IsNullOrEmpty(uid))
                return Unauthorized("Invalid token");

            var role = User.FindFirst("ur")?.Value;
            if (role == null || role.ToLower() == "student")
                return Unauthorized("Invalid role");

            var createdAccount = await _accountRepository.GetByIdAsync(Guid.Parse(uid));
            if (createdAccount == null)
                return Unauthorized("Invalid account");


            List<Guid> recipientIds = new();

            switch (newNotificationDTO.Type)
            {
                case 0:
                    break;
                case 1:
                    if (!await _roleRepository.ExistsAsync(newNotificationDTO.Value))
                        return NotFound("Role not found.");
                    recipientIds = (await _accountRepository.GetAccountByRoleNameAsync(newNotificationDTO.Value))
                                   .Select(a => a.AccountId).ToList();
                    break;
                case 2:
                    if (!await _courseRepository.ExistsAsync(newNotificationDTO.Value))
                        return NotFound("Course not found.");
                    recipientIds = await _accountRepository.GetAccountsByCourseAsync(newNotificationDTO.Value);
                    break;
                case 3:
                    if (!await _classRepository.ExistsAsync(newNotificationDTO.Value))
                        return NotFound("Class not found.");
                    recipientIds = await _accountRepository.GetAccountsByClassAsync(newNotificationDTO.Value);
                    break;
                default:
                    return BadRequest("Invalid notification type.");
            }

            var notification = new Notification
            {
                Title = newNotificationDTO.Title,
                Content = newNotificationDTO.Content,
                CreatedBy = createdAccount.AccountId,
                CreatedAt = DateTime.Now,
                Type = newNotificationDTO.Type switch { 0 => 0, 1 => 1, 2 or 3 => 2, _ => throw new ArgumentException("Invalid notification type") }
            };

            //add
            await _notificationRepository.AddAsync(notification);

            //EmailSend = true
            List<Guid> recipientIdList = new();
            List<string> recipientEmails = new();
            if (newNotificationDTO.EmailSend == true)
            {


                switch (newNotificationDTO.Type)
                {
                    case 0:
                        var accountType0 = await _accountRepository.GetAllAsync();
                        recipientEmails = accountType0.Select(a => a.Email).ToList();
                        break;
                    case 1: // Gửi theo role
                        var accountType1 = await _accountRepository.GetAllAsync();
                        recipientEmails = (await _accountRepository.GetAccountByRoleNameAsync(newNotificationDTO.Value)).Select(a => a.Email).ToList();
                        break;
                    case 2: // Gửi theo course
                        var classListbyCourse = await _classRepository.GetClassListByCourseName(newNotificationDTO.Value);
                        recipientEmails = classListbyCourse
                            .SelectMany(c => c.ClassStudents)
                            .Select(cs => cs.Student.Email)
                            .Distinct()
                            .ToList();
                        break;
                    case 3: // Gửi theo class
                        var classListbyClass = await _classRepository.GetByClassCodeAsync("PRN231-03/25");
                        recipientEmails = classListbyClass.ClassStudents
                                .Select(cs => cs.Student.Email)
                                .Distinct()
                                .ToList();
                        break;
                    default:
                        return BadRequest("Invalid notification type.");
                }

                if (recipientEmails.Any())
                {
                    string subject = $"New Notification: {newNotificationDTO.Title}";
                    string message = newNotificationDTO.Content;

                    foreach (var email in recipientEmails)
                    {
                        EmailBackgroundService.EnqueueEmail(email, subject, message);
                       //await _emailBackgroundService.EnqueueEmailAsync(email, subject, message);
                    }
                }
            }


            if (newNotificationDTO.Type == 1)
                await _notificationRepository.AssignToRolesAsync(notification.NotificationId, newNotificationDTO.Value);

            if (newNotificationDTO.Type is 2 or 3)
                await _notificationRepository.AssignToAccountsAsync(notification.NotificationId, recipientIds);

            return Ok(new { message = "Notification created successfully" });
        }

        [HttpPut("edit/{id}")]
        public async Task<IActionResult> EditNotification(Guid id, [FromBody] InputNotificationDTO notificationDTO)
        {
            var notification = await _notificationRepository.GetByIdAsync(id);
            if (notification == null)
            {
                return NotFound();
            }
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Chỉ cập nhật 3 thuộc tính: notificationId, title, content
            notification.Title = notificationDTO.Title;
            notification.Content = notificationDTO.Content;
            notification.UpdatedAt = DateTime.Now;

            await _notificationRepository.UpdateAsync(notification);
            return Ok("Notification updated successfully");
        }

        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> DeleteNotification(Guid id)
        {
            var existingNotification = await _notificationRepository.GetByIdAsync(id);
            if (existingNotification == null)
            {
                return NotFound("Notification not found.");
            }
            await _notificationRepository.DeleteAsync(id);
            return Ok("Notification deleted successfully.");
        }
    }
}
