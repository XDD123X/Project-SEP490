using OTMS.BLL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OTMS.DAL.Interface
{
    public interface INotificationRepository : IRepository<Notification>
    {
        Task<List<Notification>> GetAllAccountNotificationAsync();
        Task<List<Notification>> GetAllCommonNotificationAsync();
        Task<List<Notification>> GetAllRoleNotificationAsync();
    }
}
