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


        private readonly IServiceScopeFactory _scopeFactory;

       


        public OfficerController(IMapper mapper, IScheduleRepository scheduleRepository, IAccountRepository accountRepository, IServiceScopeFactory scopeFactory)
        {
            _mapper = mapper;
            _scheduleRepository = scheduleRepository;
            _accountRepository = accountRepository;
            _scopeFactory = scopeFactory;

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

                worksheet.Cell(currentRow, 1).Value = "Student AccountID";
                worksheet.Cell(currentRow, 2).Value = "Student Email";
                worksheet.Cell(currentRow, 3).Value = "Student FullName";

                worksheet.Cell(currentRow, 4).Value = "Parent Full Name";
                worksheet.Cell(currentRow, 5).Value = "ParentGender";
                worksheet.Cell(currentRow, 6).Value = "Parent Phone Number";
                worksheet.Cell(currentRow, 7).Value = "Parent Email";

                foreach (var account in accountStudent)
                {
                    currentRow++;
                    worksheet.Cell(currentRow, 1).Value = account.AccountId.ToString();
                    worksheet.Cell(currentRow, 2).Value = account.Email;
                    worksheet.Cell(currentRow, 3).Value = account.FullName;

                }
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



        private readonly List<string> RequiredHeaders = new List<string>
        {
            "Student AccountID", "Student Email", "Student FullName",
            "Parent Full Name", "ParentGender", "Parent Phone Number", "Parent Email"
        };

        [HttpPost("import-student-accounts")]
        public IActionResult ImportStudentAccounts(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest("File is empty or null.");
            }

            try
            {
                using (var stream = new MemoryStream())
                {
                    file.CopyTo(stream);
                    using (var workbook = new XLWorkbook(stream))
                    {
                        var worksheet = workbook.Worksheet(1);
                        var firstRow = worksheet.Row(1);
                        var headers = firstRow.Cells().Select(cell => cell.Value.ToString()).ToList();

                        if (!RequiredHeaders.All(headers.Contains))
                        {
                            return BadRequest("File Excel không đúng định dạng. Hãy đảm bảo có đầy đủ các cột yêu cầu.");
                        }

                        int rowCount = worksheet.RowsUsed().Count();

                        using (var context = new OtmsContext()) 
                        {
                            for (int row = 2; row <= rowCount; row++)
                            {
                                Parent parent = new Parent
                                {
                                    StudentId = Guid.Parse(worksheet.Cell(row, 1).GetValue<string>()),
                                    FullName = worksheet.Cell(row, 4).GetValue<string>(),
                                    PhoneNumber = worksheet.Cell(row, 6).GetValue<string>(),
                                    Email = worksheet.Cell(row, 7).GetValue<string>(),
                                    Gender = worksheet.Cell(row, 5).GetValue<string>() == "M" ? 1 : 0,
                                    Status = 1
                                };

                                _accountRepository.ImportParent(parent).Wait(); 
                            }

                            return Ok(new { message = "File Excel hợp lệ" });
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error importing student accounts: {ex.Message}");
                return StatusCode(500, "Đã xảy ra lỗi trong quá trình xử lý.");
            }
        }






    }
}

    
