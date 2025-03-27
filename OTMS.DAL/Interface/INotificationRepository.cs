using OTMS.BLL.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace OTMS.DAL.Interface
{
    public interface INotificationRepository : IRepository<Notification>
    {
        Task<List<Notification>> GetAllAccountNotificationAsync(Guid accountId);
        Task<List<Notification>> GetAllCommonNotificationAsync();
        Task<List<Notification>> GetNotificationManagementAsync(Guid accountId);
        Task<List<Notification>> GetAllRoleNotificationAsync(string roleName);
        Task AssignToAccountsAsync(Guid notificationId, List<Guid> accountIds);
        Task AssignToRolesAsync(Guid notificationId, string roleName);

        Task<List<Notification>> GetNotificationsByAccountOrRole(Guid? accountId, string? roleName);
        public  Task isRead(Guid notificationId, Guid accountId);


    }
}
