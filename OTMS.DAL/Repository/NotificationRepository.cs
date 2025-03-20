using OTMS.BLL.Models;
using OTMS.DAL.DAO;
using OTMS.DAL.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
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

        public Task<List<Notification>> GetAllAccountNotificationAsync() => _notificationDAO.GetAllAccountNotificationAsync();

        public Task<List<Notification>> GetAllCommonNotificationAsync() => _notificationDAO.GetAllCommonNotificationAsync();

        public Task<List<Notification>> GetAllRoleNotificationAsync() => _notificationDAO.GetAllRoleNotificationAsync();
    }
}
