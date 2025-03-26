using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using OTMS.BLL.DTOs;
using OTMS.BLL.Models;
using OTMS.DAL.Interface;
using OTMS.DAL.Repository;
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

        public NotificationsController(INotificationRepository notificationRepository, IRoleRepository roleRepository, IAccountRepository accountRepository, ICourseRepository courseRepository, IClassRepository classRepository, IMapper mapper)
        {
            _notificationRepository = notificationRepository;
            _roleRepository = roleRepository;
            _accountRepository = accountRepository;
            _courseRepository = courseRepository;
            _classRepository = classRepository;
            _mapper = mapper;
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
                    Common = mappedMergedNotifications,
                    Private = mappedPrivateNotifications
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("list")]
        public async Task<IActionResult> GetNotification()
        {
            var notifications = await _notificationRepository.GetAllAsync();
            return Ok(notifications);
        }

        [HttpGet("common")]
        public async Task<IActionResult> GetCommonNotification()
        {
            var notifications = await _notificationRepository.GetAllCommonNotificationAsync();
            return Ok(notifications);
        }


        [HttpGet("account/{accountId}")]
        public async Task<IActionResult> GetNotificationByAccount(Guid accountId)
        {
            var notifications = await _notificationRepository.GetAllAccountNotificationAsync(accountId);
            return Ok(notifications);
        }

        [HttpGet("role/{roleName}")]
        public async Task<IActionResult> GetNotificationByRole(string roleName)
        {
            var notifications = await _notificationRepository.GetAllRoleNotificationAsync(roleName);
            return Ok(notifications);
        }


        [HttpGet("{id}")]
        public async Task<IActionResult> GetNotificationById(Guid id)
        {
            var notification = await _notificationRepository.GetByIdAsync(id);
            if (notification == null) return NotFound("Notification not found");
            return Ok(notification);
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

            await _notificationRepository.AddAsync(notification);

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
            _mapper.Map(notificationDTO, notification);
            notification.UpdatedAt = DateTime.UtcNow;
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



        [HttpGet("getNotificationAsRoleOrAccountId")]
        public async Task<IActionResult> GetNotificationAsRoleOrAccountId([FromQuery] Guid? accountId, [FromQuery] string? roleName)
        {
            var notifications = await _notificationRepository.GetNotificationsByAccountOrRole(accountId, roleName);
            return Ok(notifications);
        }

        [HttpPut("isRead")]

        public async Task isRead(Guid notificationId, Guid accountId)
        {
            await _notificationRepository.isRead(notificationId, accountId);
        }
    }
}
