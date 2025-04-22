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
        new Task<Account?> GetByIdAsync(Guid id);
        Task<Account?> GetByEmailAsync(string email);
        Task<bool> ExistsByEmailAsync(string email);
        Task<List<string>> GetAllEmailsAsync();
        Task AddMultipleAsync(List<Account> accounts);

        Task<Account?> GetByLogin(string email, string password);
        Task<List<Account>> GetByStudentByClass(Guid classId);
        public Task<List<Account>> GetByStudentByClassCode(string code);

        new Task UpdateAsync(Account account);



        Task<Role?> GetRoleByRoleName(string RoleName);
        Task<List<Account>> getAllStudentAccount(string roleId);
        Task ImportParent(Parent parent);

        Task<List<Account>> GetStudentList();
        Task<List<Account>> GetLecturerList();
        Task<List<Account>> GetOfficerList();
        Task<List<Account>> GetAccountListAsync();
        Task<List<Account>> GetAccountByRoleNameAsync(string roleName);
        Task<List<Guid>> GetAccountsByCourseAsync(string courseName);
        Task<List<Guid>> GetAccountsByClassAsync(string classCode);
        Task<bool> AddAccount(Account account);
        Task<bool> DeleteAccount(Guid accountId);
        Task<bool> updateImageAccount(Guid accountId, string newImgUrl);


    }
}
