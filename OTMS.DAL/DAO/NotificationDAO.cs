using Microsoft.EntityFrameworkCore;
using OTMS.BLL.Models;
using OTMS.DAL.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace OTMS.DAL.DAO
{
    public class NotificationDAO : GenericDAO<Notification>
    {
        public NotificationDAO(OtmsContext context) : base(context) { }
        public async Task<List<Notification>> GetAllCommonNotificationAsync()
        {
            return await _context.Notifications
                .Where(n => !_context.NotificationRoles.Any(nr => nr.NotificationId == n.NotificationId) &&
                            !_context.NotificationAccounts.Any(na => na.NotificationId == n.NotificationId))
                .Include(n => n.CreatedByNavigation)
                .ThenInclude(u => u.Role)
                .ToListAsync();
        }
        public async Task<List<Notification>> GetAllAccountNotificationAsync(Guid accountId)
        {
            return await _context.Notifications
                .Where(n => _context.NotificationAccounts
                    .Any(na => na.NotificationId == n.NotificationId && na.AccountId == accountId))
                .Include(n => n.CreatedByNavigation)
                .ToListAsync();
        }
        public async Task<List<Notification>> GetAllRoleNotificationAsync(string roleName)
        {
            return await _context.Notifications
                .Where(n => _context.NotificationRoles
                    .Any(nr => nr.NotificationId == n.NotificationId && nr.RoleName == roleName))
                .Include(n => n.CreatedByNavigation)
                .ToListAsync();
        }
        public async Task<List<Notification>> GetNotificationManagementAsync(Guid accountId)
        {
            //get from db
            var account = await _context.Accounts
                .Include(a => a.Role)
                .FirstOrDefaultAsync(a => a.AccountId == accountId);

            if (account == null)
            {
                throw new Exception("Invalid accountId.");
            }

            string role = account.Role.Name.ToLower();

            //all
            var notifications = await _context.Notifications
                .Include(n => n.NotificationRoles)
                .Include(n => n.NotificationAccounts)
                .Include(n => n.CreatedByNavigation)
                .ThenInclude(a => a.Role)
                .ToListAsync();

            //filter by role
            if (role == "administrator")
            {
                return notifications;
            }
            else if (role == "officer")
            {
                return notifications.Where(n => n.CreatedByNavigation.Role.Name != "administrator").ToList();
            }
            else if (role == "lecturer")
            {
                return notifications.Where(n => n.CreatedByNavigation.AccountId == accountId).ToList();
            }
            else
            {
                return new List<Notification> { };
            }
        }
        public async Task AssignToAccountsAsync(Guid notificationId, List<Guid> accountIds)
        {
            var notificationAccounts = accountIds.Select(accountId => new NotificationAccount
            {
                NotificationId = notificationId,
                AccountId = accountId
            }).ToList();

            await _context.NotificationAccounts.AddRangeAsync(notificationAccounts);
            await _context.SaveChangesAsync();
        }
        public async Task AssignToRolesAsync(Guid notificationId, string roleName)
        {
            var notificationRole = new NotificationRole
            {
                NotificationId = notificationId,
                RoleName = roleName
            };

            await _context.NotificationRoles.AddAsync(notificationRole);
            await _context.SaveChangesAsync();
        }
        public async Task<List<Notification>> GetNotificationsByAccountOrRole(Guid? accountId, string? roleName)
        {
            using (var context = new OtmsContext())
            {
                var query = from n in context.Notifications
                            join nr in context.NotificationRoles on n.NotificationId equals nr.NotificationId into nrGroup
                            from nr in nrGroup.DefaultIfEmpty()
                            join na in context.NotificationAccounts on n.NotificationId equals na.NotificationId into naGroup
                            from na in naGroup.DefaultIfEmpty()
                            where (roleName == null || nr.RoleName == roleName)
                               || (accountId == null || na.AccountId == accountId)
                            select n;

                return await query.Distinct().ToListAsync();
            }
        }
        public async Task isRead(Guid notificationId, Guid accountId)
        {
            NotificationAccount notification = _context.NotificationAccounts.FirstOrDefault(nr => nr.NotificationId == notificationId && nr.AccountId == accountId);

            notification.IsRead = true;
            _context.NotificationAccounts.Update(notification);
            await _context.SaveChangesAsync();
        }


    }
}
