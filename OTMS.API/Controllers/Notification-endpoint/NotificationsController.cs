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
        private readonly IAccountRepository _accountRepository;
        private readonly IMapper _mapper;

        public NotificationsController(IAccountRepository accountRepository, INotificationRepository notificationRepository, IMapper mapper)
        {
            _notificationRepository = notificationRepository;
            _mapper = mapper;
            _accountRepository = accountRepository;
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

                var result = new
                {
                    Common = mergedNotifications,
                    Private = privateNotifications
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
        public async Task<IActionResult> CreateNotification([FromBody] InputNotificationDTO newNotificationDTO, [FromQuery] List<Guid>? accountIds, [FromQuery] List<string>? roleNames)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var newNotification = _mapper.Map<Notification>(newNotificationDTO);
            newNotification.NotificationId = Guid.NewGuid();
            newNotification.CreatedAt = DateTime.UtcNow;

            var userIdClaim = User.FindFirst("uid"); ;
            if (userIdClaim != null && Guid.TryParse(userIdClaim.Value, out Guid createdBy))
            {
                newNotification.CreatedBy = createdBy;
            }
            else
            {
                return Unauthorized("User not authenticated.");
            }

            try
            {
                await _notificationRepository.AddAsync(newNotification);

                switch (newNotification.Type)
                {
                    case 0:
                        break;
                    case 1:
                        if (roleNames != null)
                        {
                            await _notificationRepository.AssignToRolesAsync(newNotification.NotificationId, roleNames);
                        }
                        break;
                    case 2:
                        if (accountIds != null)
                        {
                            await _notificationRepository.AssignToAccountsAsync(newNotification.NotificationId, accountIds);
                        }
                        break;
                }

                return Ok(new
                {
                    message = "Notification created successfully",
                    notificationId = newNotification.NotificationId,
                });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                new { message = $"An error occurred while creating notification: {ex.Message}" });
            }
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
            try
            {
                _mapper.Map(notificationDTO, notification);
                notification.UpdatedAt = DateTime.UtcNow;
                await _notificationRepository.UpdateAsync(notification);
                return Ok("Notification updated successfully");
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    $"An error occurred while updating notification {id}: {ex.Message}");
            }
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
<<<<<<< Updated upstream:OTMS.API/Controllers/Admin-Endpoint/NotificationController.cs

        [HttpPut("isRead")]

        public async Task isRead(Guid notificationId, Guid accountId)
        {
            await _notificationRepository.isRead(notificationId, accountId);
        }


=======
>>>>>>> Stashed changes:OTMS.API/Controllers/Notification-endpoint/NotificationsController.cs
    }
}
