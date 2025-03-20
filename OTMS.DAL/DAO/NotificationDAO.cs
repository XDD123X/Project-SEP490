using OTMS.BLL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OTMS.DAL.DAO
{
    public class NotificationDAO : GenericDAO<Notification>
    {
        public NotificationDAO(OtmsContext context) : base(context) { }

        public async Task<List<Notification>> GetAllAccountNotificationAsync()
        {
            return;
        }

        internal async Task<List<Notification>> GetAllCommonNotificationAsync()
        {
            throw new NotImplementedException();
        }

        internal async Task<List<Notification>> GetAllRoleNotificationAsync()
        {
            throw new NotImplementedException();
        }
    }
}
