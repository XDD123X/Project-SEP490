using BusinessObject.Models;
using Microsoft.EntityFrameworkCore;
using OTMS_DLA.DAO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace OTMSAPI.DAO
{
    public class AccountDAO : GenericDAO<Account>
    {
        public AccountDAO(OtmsContext context) : base(context) { }

        public async Task<Account?> GetByEmailAsync(string email)
        {
            return await _context.Accounts.FirstOrDefaultAsync(a => a.Email == email);
        }

        public async Task<bool> ExistsByEmailAsync(string email)
        {
            return await _context.Accounts.AnyAsync(a => a.Email == email);
        }

        public async Task<List<string>> GetAllEmailsAsync()
        {
            return await _context.Accounts.Select(a => a.Email).ToListAsync();
        }

        public async Task<List<Account>> GetAccountsAsync(int page, int pageSize, string? search, int? status, string? classCode, DateTime? date, string sortBy, string sortOrder)
        {
            IQueryable<Account> query = _context.Accounts.Include(a => a.Role);

            if (!string.IsNullOrEmpty(search))
                query = query.Where(u => u.FullName.Contains(search) || u.Email.Contains(search));

            if (status.HasValue)
                query = query.Where(u => u.Status == status);

            if (!string.IsNullOrEmpty(classCode))
                query = query.Where(u => _context.ClassStudents
                    .Where(cs => _context.Classes.Any(c => c.ClassId == cs.ClassId && c.ClassCode == classCode))
                    .Select(cs => cs.StudentId)
                    .Contains(u.AccountId));

            if (date.HasValue)
                query = query.Where(u => u.CreatedAt == date.Value.Date);

            query = sortOrder.ToLower() == "desc"
                ? query.OrderByDescending(GetSortExpression(sortBy))
                : query.OrderBy(GetSortExpression(sortBy));

            return await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
        }

        public async Task<int> GetTotalAccountsAsync(string search, int? status, string? classCode, DateTime? date)
        {
            IQueryable<Account> query = _context.Accounts;

            if (!string.IsNullOrEmpty(search))
                query = query.Where(u => u.FullName.Contains(search) || u.Email.Contains(search));

            if (status.HasValue)
                query = query.Where(u => u.Status == status);

            if (date.HasValue)
                query = query.Where(u => u.CreatedAt == date.Value.Date);

            return await query.CountAsync();
        }

        private static Expression<Func<Account, object>> GetSortExpression(string sortBy)
        {
            return sortBy.ToLower() switch
            {
                "fullname" => u => u.FullName,
                "email" => u => u.Email,
                "status" => u => u.Status,
                "role" => u => u.Role.Name,
                "date" => u => u.CreatedAt,
                _ => u => u.FullName
            };
        }

        public async Task AddMultipleAsync(List<Account> accounts)
        {
            if (accounts == null || !accounts.Any()) return;

            await _context.Accounts.AddRangeAsync(accounts);
            await _context.SaveChangesAsync();
        }
    }
}
