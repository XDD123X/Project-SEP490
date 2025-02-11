using BusinessObject.DTOs;
using BusinessObject.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using ClosedXML.Excel;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;
using OTMS_DLA.Interface;

namespace OTMSAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountManamentController : ControllerBase
    {
        private readonly IAccountRepository _accountRepository;

        public AccountManamentController(IAccountRepository accountRepository)
        {
            _accountRepository = accountRepository;
        }
        [HttpGet("export-template")]
        public IActionResult ExportUserTemplate()
        {
            using var workbook = new XLWorkbook();
            var worksheet = workbook.Worksheets.Add("Users");

            worksheet.Cell(1, 1).Value = "Full Name";
            worksheet.Cell(1, 2).Value = "Email";
            worksheet.Cell(1, 3).Value = "Role";
            worksheet.Cell(1, 4).Value = "Phone Number";

            worksheet.Columns().AdjustToContents();

            using var stream = new MemoryStream();
            workbook.SaveAs(stream);
            stream.Position = 0;

            return File(stream.ToArray(), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "UserTemplate.xlsx");
        }
        [HttpPost("import-users")]
        public async Task<IActionResult> ImportUsers(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("File không hợp lệ.");
            try
            {
                var fileBytes = await _accountRepository.ImportUsersAsync(file);
                return File(fileBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "ImportResult.xlsx");
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
        [HttpGet("accounts-list")]
        public async Task<IActionResult> GetAccounts(
           [FromQuery] int page = 1,
           [FromQuery] int pageSize = 10,
           [FromQuery] string? search = null,
           [FromQuery] int? status = null,
           [FromQuery] string? classCode = null,
           [FromQuery] string? role = null,
           [FromQuery] DateTime? date = null,
           [FromQuery] string sortBy = "fullName",
           [FromQuery] string sortOrder = "desc")
        {
            var users = await _accountRepository.GetAccountsAsync(page, pageSize, search, status, classCode, date, sortBy, sortOrder);
            var totalUsers = await _accountRepository.GetTotalAccountsAsync(search, status, classCode, date);

            return Ok(new
            {
                TotalUsers = totalUsers,
                Page = page,
                PageSize = pageSize,
                Users = users
            });
        }

        [HttpGet("find-account{id}")]
        public async Task<IActionResult> GetUserById(int id)
        {
            var user = await _accountRepository.GetByIdAsync(id);
            if (user == null) return NotFound("User not found");
            return Ok(user);
        }

        [HttpPut("ban-accounts-{id}")]
        public async Task<IActionResult> BanUser(int id)
        {
            bool result = await _accountRepository.BanAccountAsync(id);
            return result ? Ok("User banned") : NotFound("User not found");
        }

        [HttpPut("activate-accounts-{id}")]
        public async Task<IActionResult> ActivateUser(int id)
        {
            bool result = await _accountRepository.ActivateAccountAsync(id);
            return result ? Ok("User activated") : NotFound("User not found");
        }
    }
}