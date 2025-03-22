﻿using DocumentFormat.OpenXml.Spreadsheet;
using Microsoft.EntityFrameworkCore;
using OTMS.BLL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace OTMS.DAL.DAO
{
    public class AccountDAO : GenericDAO<Account>
    {
        public AccountDAO(OtmsContext context) : base(context) { }
        public new async Task<Account?> GetByIdAsync(Guid id)
        {
            return await _dbSet
                .Include(a => a.Role)
                .FirstOrDefaultAsync(a => a.AccountId == id);
        }

        public async Task<Account?> GetByEmailAsync(string email)
        {
            return await _context.Accounts
                .Where(a => a.Email == email).
                Include(a => a.Role)
                .Include(a => a.LecturerSchedules)
                .FirstOrDefaultAsync();
        }

        public async Task<bool> ExistsByEmailAsync(string email)
        {
            return await _context.Accounts.AnyAsync(a => a.Email == email);
        }

        public async Task<List<string>> GetAllEmailsAsync()
        {
            return await _context.Accounts.Select(a => a.Email).ToListAsync();
        }

        public async Task<int> GetTotalAccountsAsync(string? search, int? status, string? classCode, DateTime? date)
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


        public async Task AddMultipleAsync(List<Account> accounts)
        {
            if (accounts == null || !accounts.Any()) return;

            await _dbSet.AddRangeAsync(accounts);
            await _context.SaveChangesAsync();
        }

        public async Task<Account?> GetByLogin(string email, string password)
        {
            return await _context.Accounts
                .Where(a => a.Email == email && a.Password == password)
                .Include(a => a.Role)
                .FirstOrDefaultAsync();
        }

        public async Task<List<Account>> GetStudentByClass(Guid classId)
        {
            var accounts = await _context.Accounts
                .Where(a => a.ClassStudents
                .Any(cs => cs.ClassId == classId))
                .ToListAsync();
            return accounts;
        }


        public new async Task UpdateAsync(Account account)
        {
            _context.Accounts.Update(account);
            await _context.SaveChangesAsync();
        }

        public async Task<Role?> GetRoleByRoleName(string roleName)
        {
            return await _context.Roles
                .FirstOrDefaultAsync(r => r.Name.Equals(roleName, StringComparison.OrdinalIgnoreCase));
        }

        public async Task<List<Account>> getAllStudentAccount(string roleId)
        {

            List<Account> accounts = await _context.Accounts
                .Where(a => a.RoleId == new Guid(roleId))
                .ToListAsync();
            return accounts;
        }


        public async Task ImportParent(Parent parent)
        {
            try
            {
                using (OtmsContext context = new OtmsContext())
                {
                    var existingParent = await context.Parents
                        .Where(x => x.StudentId == parent.StudentId)
                        .FirstOrDefaultAsync();

                    if (existingParent == null)
                    {
                        await context.Parents.AddAsync(parent);
                    }
                    else
                    {
                        existingParent.FullName = parent.FullName;
                        existingParent.PhoneNumber = parent.PhoneNumber;
                        existingParent.Email = parent.Email;
                        existingParent.Gender = parent.Gender;
                        existingParent.Status = parent.Status;

                        context.Parents.Update(existingParent);
                    }

                    await context.SaveChangesAsync();
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error importing parent: {ex.Message}");
                throw;
            }
        }


        public async Task<List<Account>> GetStudentList()
        {
            try
            {
                return await _context.Accounts
                    .Include(s => s.Parents)
                    .Where(a => a.Role.Name == "Student")
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
                throw;
            }
        }

        public async Task<List<Account>> GetLecturerList()
        {
            try
            {
                return await _context.Accounts
                    .Where(a => a.Role.Name == "Lecturer")
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
                throw;
            }
        }

        public async Task<List<Account>> GetOfficerList()
        {
            try
            {
                return await _context.Accounts
                   .Where(a => a.Role.Name == "Officer")
                   .ToListAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
                throw;
            }
        }

        public async Task<List<Account>> GetAccountListAsync()
        {
            try
            {
                var accounts = await _context.Accounts
                    .Include(s => s.Parents)
                    .Include(a => a.Role).ToListAsync();
                return accounts;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
                throw;
            }
        }

        public async Task<bool> AddAccount(Account account)
        {
            try
            {
                await _context.Accounts.AddAsync(account);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error when adding account: {ex.Message}");
                return false;

            }
        }
    }
}
