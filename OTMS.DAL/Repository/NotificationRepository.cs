using DocumentFormat.OpenXml.Office2010.PowerPoint;
using OTMS.BLL.Models;
using OTMS.DAL.DAO;
using OTMS.DAL.Interface;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace OTMS.DAL.Repository
{
    public class NotificationRepository : Repository<Notification>, INotificationRepository
    {
        private readonly NotificationDAO _notificationDAO;

        public NotificationRepository(NotificationDAO notificationDAO) : base(notificationDAO)
        {
            _notificationDAO = notificationDAO;
        }
        public Task<List<Notification>> GetAllAccountNotificationAsync(Guid accountId)
        {
            return _notificationDAO.GetAllAccountNotificationAsync(accountId);
        }
        public Task<List<Notification>> GetAllCommonNotificationAsync()
        {
            return _notificationDAO.GetAllCommonNotificationAsync();
        }
        public Task<List<Notification>> GetAllRoleNotificationAsync(string roleName)
        {
            return _notificationDAO.GetAllRoleNotificationAsync(roleName);
        }
        public async Task AssignToAccountsAsync(Guid notificationId, List<Guid> accountIds) => await _notificationDAO.AssignToAccountsAsync(notificationId, accountIds);

        public async Task AssignToRolesAsync(Guid notificationId, string roleName) => await _notificationDAO.AssignToRolesAsync(notificationId, roleName);


        public Task<List<Notification>> GetNotificationsByAccountOrRole(Guid? accountId, string? roleName)
        {
            return _notificationDAO.GetNotificationsByAccountOrRole(accountId, roleName);
        }

        public async Task isRead(Guid notificationId, Guid accountId) => await _notificationDAO.isRead(notificationId, accountId);

        public Task<List<Notification>> GetNotificationManagementAsync(Guid accountId) => _notificationDAO.GetNotificationManagementAsync(accountId);
    }
}
