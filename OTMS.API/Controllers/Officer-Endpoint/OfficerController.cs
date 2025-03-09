using AutoMapper;
using ClosedXML.Excel;
using DocumentFormat.OpenXml.Wordprocessing;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using OTMS.BLL.DTOs;
using OTMS.BLL.Models;
using OTMS.DAL.Interface;
using OTMS.DAL.Repository;
using System.Globalization;

namespace OTMS.API.Controllers.Officer_Endpoint
{
    [Route("api/[controller]")]
    [ApiController]
    public class OfficerController : ControllerBase
    {
        private readonly IMapper _mapper;
        private readonly IScheduleRepository _scheduleRepository;
        private readonly IAccountRepository _accountRepository;

        public OfficerController(IMapper mapper, IScheduleRepository scheduleRepository, IAccountRepository accountRepository)
        {
            _mapper = mapper;
            _scheduleRepository = scheduleRepository;
            _accountRepository = accountRepository;
        }
        [HttpGet("all-schedule")]
        public async Task<IActionResult> GetAllSchedule()
        {
            var allSchedule = await _scheduleRepository.GetAllAsync();
            return Ok(new { allSchedule });
        }

        [HttpGet("get-all-student-account-to-import-parent")]
        public async Task<IActionResult> GetAllStudentAccountExcelFile()
        {
            List<Account> accountStudent = await _accountRepository.getAllStudentAccount();

            using (var workbook = new XLWorkbook())
            {
                var worksheet = workbook.Worksheets.Add("Student Accounts");
                var currentRow = 1;

                // Tiêu đề cột
                worksheet.Cell(currentRow, 1).Value = "Student AccountID";
                worksheet.Cell(currentRow, 2).Value = "Student Email";
                worksheet.Cell(currentRow, 3).Value = "Student FullName";

                worksheet.Cell(currentRow, 4).Value = "Parent Full Name";
                worksheet.Cell(currentRow, 5).Value = "ParentGender";
                worksheet.Cell(currentRow, 6).Value = "Parent Phone Number";
                worksheet.Cell(currentRow, 7).Value = "Parent Email";

                // Đổ dữ liệu vào file Excel
                foreach (var account in accountStudent)
                {
                    currentRow++;
                    worksheet.Cell(currentRow, 1).Value = account.AccountId.ToString();
                    worksheet.Cell(currentRow, 2).Value = account.Email;
                    worksheet.Cell(currentRow, 3).Value = account.FullName;

                }
                //định dạng cột
                worksheet.Column(1).Style.Fill.BackgroundColor = XLColor.LightBlue;

                worksheet.Column(1).Width = 35;
                worksheet.Column(2).Width = 20;
                worksheet.Column(3).Width = 20;
                worksheet.Column(4).Width = 20;
                worksheet.Column(5).Width = 10;
                worksheet.Column(6).Width = 20;
                worksheet.Column(7).Width = 30;


                using (var stream = new MemoryStream())
                {
                    workbook.SaveAs(stream);
                    var content = stream.ToArray();
                    return File(content, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "StudentAccounts.xlsx");
                }
            }
        }







    }
}
