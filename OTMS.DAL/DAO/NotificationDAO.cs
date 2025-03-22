using Microsoft.EntityFrameworkCore;
using OTMS.BLL.Models;
using OTMS.DAL.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace OTMS.DAL.DAO
{
    public class NotificationDAO : GenericDAO<Notification>, INotificationRepository
    {
        public NotificationDAO(OtmsContext context) : base(context) { }
        public async Task<List<Notification>> GetAllCommonNotificationAsync()
        {
            return await _context.Notifications
                .Where(n => !_context.NotificationRoles.Any(nr => nr.NotificationId == n.NotificationId) &&
                            !_context.NotificationAccounts.Any(na => na.NotificationId == n.NotificationId))
                .ToListAsync();
        }
        public async Task<List<Notification>> GetAllAccountNotificationAsync(Guid accountId)
        {
            return await _context.Notifications
                .Where(n => _context.NotificationAccounts
                    .Any(na => na.NotificationId == n.NotificationId && na.AccountId == accountId))
                .ToListAsync();
        }
        public async Task<List<Notification>> GetAllRoleNotificationAsync(string roleName)
        {
            return await _context.Notifications
                .Where(n => _context.NotificationRoles
                    .Any(nr => nr.NotificationId == n.NotificationId && nr.RoleName == roleName))
                .ToListAsync();
        }
        public async Task AssignToAccountsAsync(Guid notificationId, List<Guid> accountIds)
        {
            var notificationAccounts = accountIds.Select(aid => new NotificationAccount
            {
                NotificationId = notificationId,
                AccountId = aid,
                IsRead = false
            }).ToList();

            await _context.NotificationAccounts.AddRangeAsync(notificationAccounts);
            await _context.SaveChangesAsync();
        }
        public async Task AssignToRolesAsync(Guid notificationId, List<string> roleNames)
        {
            var notificationRoles = roleNames.Select(role => new NotificationRole
            {
                NotificationId = notificationId,
                RoleName = role
            }).ToList();

            await _context.NotificationRoles.AddRangeAsync(notificationRoles);
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



    }
}
