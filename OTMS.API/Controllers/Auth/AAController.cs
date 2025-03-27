using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using OTMS.BLL.Models;
using OTMS.DAL.Interface;

namespace OTMS.API.Controllers.Auth
{
    [Route("api/[controller]")]
    [ApiController]
    public class AAController : ControllerBase
    {
        private readonly OtmsContext _context;
        private readonly IClassRepository _classRepository;
        private readonly IAccountRepository _accountRepository;
        public AAController(OtmsContext context, IClassRepository classRepository, IAccountRepository accountRepository)
        {
            _context = context;
            _classRepository = classRepository;
            _accountRepository = accountRepository;
        }

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var result = await _classRepository.GetByClassCodeAsync("PRN231-03/25");

            var studentEmails = result.ClassStudents
                    .Select(cs => cs.Student.Email) // Lấy email từ Student
                    .Distinct() // Loại bỏ email trùng lặp
                    .ToList();

            return Ok(studentEmails);
        }
    }
}
