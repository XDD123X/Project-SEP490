using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using OTMS.BLL.DTOs;
using OTMS.BLL.Models;
using OTMS.DAL.DAO;
using OTMS.DAL.Interface;
using OTMS.DAL.Repository;

namespace OTMS.API.Controllers.Admin_Endpoint
{
    [Route("api/[controller]")]
    [ApiController]
    public class NotificationController : ControllerBase
    {
        private readonly INotificationRepository _notificationRepository;
        private readonly IMapper _mapper;

        public NotificationController(INotificationRepository notificationRepository, IMapper mapper)
        {
            _notificationRepository = notificationRepository;
            _mapper = mapper;
        }
        [HttpGet("notification-list")]
        public async Task<IActionResult> GetNotification()
        {
            var notificationList = await _notificationRepository.GetAllAsync();
            return Ok(notificationList);
        }
        [HttpGet("common-notification-list")]
        public async Task<IActionResult> GetCommonNotification()
        {
            var notificationList = await _notificationRepository.GetAllCommonNotificationAsync();
            return Ok(notificationList);
        }

        [HttpGet("account-notification-list")]
        public async Task<IActionResult> GetNotificationByAccount(Guid aid)
        {
            var notificationList = await _notificationRepository.GetAllAccountNotificationAsync();
            return Ok(notificationList);
        }
        [HttpGet("role-notification-list")]
        public async Task<IActionResult> GetNotificationByRole(Guid rid)
        {
            var notificationList = await _notificationRepository.GetAllRoleNotificationAsync();
            return Ok(notificationList);
        }
        [HttpGet("find-notification/{id}")]
        public async Task<IActionResult> GetNotificationById(Guid id)
        {
            var Class = await _notificationRepository.GetByIdAsync(id);
            if (Class == null) return NotFound("Notification not found");
            return Ok(Class);
        }
        [HttpPost("create")]
        public async Task<IActionResult> CreateNotification(InputNotificationDTO newNotificationDTO, List<Guid>? listId, )
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var newNotification = _mapper.Map<Notification>(newNotificationDTO);
            newNotification.CreatedBy = new Guid();
            newNotification.CreatedAt = DateTime.Now;
            switch (newNotification.Type)
            {
                case 0:
                    break;
                case 1:
                    break;
                case 2:
                    break;
            }
            try
            {
                await _notificationRepository.AddAsync(newNotification);
                return Ok(new
                {
                    message = "Create class successful",
                    classId = newNotification.NotificationId,
                });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                new { message = $"An error occurred while creating class: {ex.Message}" });
            }
        }
        [HttpPut("edit/{id}")]
        public async Task<IActionResult> EditNotification(Guid id, InputNotificationDTO notification)
        {
            var n = await _notificationRepository.GetByIdAsync(id);
            if (n == null)
            {
                return NotFound();
            }
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            try
            {
                _mapper.Map(notification, n);
                n.UpdatedAt = DateTime.Now;
                await _notificationRepository.UpdateAsync(n);
                return Ok("Update success");
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while edit class " + id + ": " + ex.Message);
            }
        }
        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> DeleteNotification(Guid id)
        {
            var existingClass = await _notificationRepository.GetByIdAsync(id);
            if (existingClass == null)
            {
                return NotFound("Notification not found.");
            }
            await _notificationRepository.DeleteAsync(id);

            return Ok("Notification deleted successfully.");
        }
    }
}
