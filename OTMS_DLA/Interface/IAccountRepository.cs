using BusinessObject.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Principal;
using System.Text;
using System.Threading.Tasks;
using ClosedXML.Excel;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;
namespace OTMS_DLA.Interface
{
    public interface IAccountRepository
    {
        Task<List<Account>> GetAccountsAsync(int page, int pageSize, string? search, int? status, string? classCode, DateTime? date, string sortBy, string sortOrder);
        Task<int> GetTotalAccountsAsync(string? search, int? status, string? classCode, DateTime? date);
        Task<Account?> GetByIdAsync(int id);
        Task<Account> CreateAccountAsync(Account account);
        Task<bool> UpdateAccountAsync(Account account);
        Task<bool> BanAccountAsync(int id);
        Task<bool> ActivateAccountAsync(int id);
        Task<byte[]> ImportUsersAsync(IFormFile file);
    }
}
