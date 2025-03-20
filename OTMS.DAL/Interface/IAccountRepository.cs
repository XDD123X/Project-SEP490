using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Principal;
using System.Text;
using System.Threading.Tasks;
using ClosedXML.Excel;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;
using OTMS.BLL.Models;

namespace OTMS.DAL.Interface
{
    public interface IAccountRepository : IRepository<Account>
    {
        Task<Account?> GetByIdAsync(Guid id);
        Task<Account?> GetByEmailAsync(string email);
        Task<bool> ExistsByEmailAsync(string email);
        Task<List<string>> GetAllEmailsAsync();
        Task AddMultipleAsync(List<Account> accounts);
        Task<List<Account>> GetAccountsAsync(int page, int pageSize, string? search, int? status, string? classCode, DateTime? date, string sortBy, string sortOrder);
        Task<int> GetTotalAccountsAsync(string? search, int? status, string? classCode, DateTime? date);

        Task<Account> GetByLogin(string email, string password);
        public Task<List<Account>> GetByStudentByClass(Guid classId);


        public Task UpdateAsync(Account account);


        public Task<List<Account>> getAllStudentAccount();
        public Task ImportParent(Parent parent);

        public Task<List<Account>> GetStudentList();
        public Task<List<Account>> GetLecturerList();
        public Task<List<Account>> GetOfficerList();
        public Task<List<Account>> GetAccountListAsync();
        public Task<bool> AddAccount(Account account);

    }
}
