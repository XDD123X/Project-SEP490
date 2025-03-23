using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using OTMS.BLL.DTOs;
using OTMS.BLL.Models;
using OTMS.BLL.Services;
using OTMS.DAL.Interface;
using System.Collections.Concurrent;

namespace OTMS.API.Controllers.Officer_Endpoint
{
    [Route("api/officer/[controller]")]
    [ApiController]
    public class AccountController : OfficerPolicyController
    {
        private readonly IAccountRepository _accountRepository;
        private readonly IMapper _mapper;
        private readonly IPasswordService _passwordService;
        private readonly IEmailService _emailService;
        private readonly IRoleRepository _roleRepository;
        private readonly IParentRepository _parentRepository;

        public AccountController(IParentRepository parentRepository, IRoleRepository roleRepository,
            IEmailService emailService, IPasswordService passwordService,
            IAccountRepository accountRepository, IMapper mapper)
        {
            _accountRepository = accountRepository;
            _mapper = mapper;
            _passwordService = passwordService;
            _emailService = emailService;
            _roleRepository = roleRepository;
            _parentRepository = parentRepository;
        }

        [HttpPost("add-list-student")]
        public async Task<IActionResult> AddListStudent([FromBody] List<AddStudentListDTO> students)
        {
            if (students == null || students.Count == 0)
                return BadRequest(new { message = "Invalid Student List!" });

            int success = 0;
            int fail = 0;
            var role = await _roleRepository.GetRoleByNameAsync("student");

            foreach (var s in students)
            {
                string plainPassword = _passwordService.RandomPassword(8);
                string hashedPassword = _passwordService.HashPassword(plainPassword);

                var student = new Account
                {
                    Email = s.Email,
                    Password = hashedPassword,
                    RoleId = role.RoleId,
                    FullName = s.FullName,
                    PhoneNumber = s.PhoneNumber,
                    Dob = s.Dob,
                    Gender = s.Gender,
                    Status = s.Status,
                    CreatedAt = s.CreatedAt
                };

                bool isAdded = await _accountRepository.AddAccount(student);

                if (isAdded)
                {
                    success++;

                    // Nội dung email
                    string subject = "Welcome To Phong Linh Class Center";
                    string message =
$@"Chào {student.FullName},

Chào mừng bạn đến với Phong Linh Class Center! 
Đây là thông tin tài khoản của bạn:

- Email: {student.Email}
- Mật khẩu: {plainPassword} (vui lòng đổi mật khẩu sau khi đăng nhập)

Truy cập hệ thống tại: https://phonglinhclass.com

Trân trọng,
Phong Linh Class Center";

                    // Thêm email vào hàng đợi
                    EmailBackgroundService.EnqueueEmail(student.Email, subject, message);
                }
                else
                {
                    fail++;
                }
            }
            return Ok(new
            {
                message = "Added Successfully!",
                success,
                fail
            });
        }

        [HttpPost("add-list-lecturer")]
        public async Task<IActionResult> AddListLecturer([FromBody] List<AddStudentListDTO> lecturers)
        {
            if (lecturers == null || lecturers.Count == 0)
                return BadRequest(new { message = "Invalid Lecturer List!" });

            int success = 0;
            int fail = 0;
            var role = await _roleRepository.GetRoleByNameAsync("lecturer");

            foreach (var l in lecturers)
            {
                string plainPassword = _passwordService.RandomPassword(8);
                string hashedPassword = _passwordService.HashPassword(plainPassword);

                var lecturer = new Account
                {
                    Email = l.Email,
                    Password = hashedPassword,
                    RoleId = role.RoleId,
                    FullName = l.FullName,
                    PhoneNumber = l.PhoneNumber,
                    Dob = l.Dob,
                    Gender = l.Gender,
                    Status = l.Status,
                    CreatedAt = l.CreatedAt
                };

                bool isAdded = await _accountRepository.AddAccount(lecturer);

                if (isAdded)
                {
                    success++;

                    // Nội dung email
                    string subject = "Welcome To Phong Linh Class Center";
                    string message =
$@"Chào {lecturer.FullName},

Chào mừng bạn đến với Phong Linh Class Center! 
Đây là thông tin tài khoản của bạn:

- Email: {lecturer.Email}
- Mật khẩu: {plainPassword} (vui lòng đổi mật khẩu sau khi đăng nhập)

Truy cập hệ thống tại: https://phonglinhclass.com

Trân trọng,
Phong Linh Class Center";

                    // Thêm email vào hàng đợi
                    EmailBackgroundService.EnqueueEmail(lecturer.Email, subject, message);
                }
                else
                {
                    fail++;
                }
            }
            return Ok(new
            {
                message = "Added Successfully!",
                success,
                fail
            });
        }

        [HttpPut("update")]
        public async Task<IActionResult> UpdateAccount([FromBody] AccountUpdate update)
        {
            if (update == null || update.AccountId == Guid.Empty)
            {
                return BadRequest("Invalid account data.");
            }

            var account = await _accountRepository.GetByIdAsync(update.AccountId);
            if (account == null)
            {
                return NotFound("Account not found.");
            }

            account.Email = update.Email;
            account.FullName = update.FullName;
            account.Fulltime = update.Fulltime;
            account.PhoneNumber = update.PhoneNumber;
            account.Dob = update.Dob;
            account.Gender = update.Gender;
            account.Status = update.Status;
            account.UpdatedAt = DateTime.UtcNow;


            if (update.Parents != null)
            {
                await _parentRepository.DeleteParentsByStudentIdAsync(update.AccountId);
                foreach (var p in update.Parents)
                {
                    var newParent = new Parent
                    {
                        FullName = p.FullName,
                        Gender = p.Gender,
                        PhoneNumber = p.PhoneNumber,
                        Email = p.Email,
                        StudentId = update.AccountId
                    };

                    await _parentRepository.AddParentAsync(newParent);
                }
            }

            return Ok("Account updated successfully.");
        }

        [HttpPost("add")]
        public async Task<IActionResult> AddAccount([FromBody] AddAccountModel newAccount)
        {
            if (newAccount == null)
            {
                return BadRequest(new { message = "Invalid account data." });
            }

            var accountExist = await _accountRepository.GetByEmailAsync(newAccount.Email);
            if (accountExist != null)
            {
                return Conflict(new { message = "Email already exists." });
            }

            var role = await _roleRepository.GetRoleByNameAsync(newAccount.Role);
            if (role == null)
            {
                return NotFound(new { message = "Invalid Role field." });
            }

            var plainPassword = _passwordService.RandomPassword(8);
            var hashedPassword = _passwordService.HashPassword(plainPassword);
            var account = new Account
            {
                AccountId = Guid.NewGuid(),
                Email = newAccount.Email,
                Password = hashedPassword,
                FullName = newAccount.FullName,
                RoleId = role.RoleId,
                Fulltime = newAccount.Fulltime,
                PhoneNumber = newAccount.PhoneNumber,
                Dob = newAccount.Dob,
                Gender = newAccount.Gender,
                Status = 3, // Invited First Time
                CreatedAt = DateTime.UtcNow
            };

            await _accountRepository.AddAsync(account);

            // Nội dung email
            string subject = "Welcome To Phong Linh Class Center";
            string message =
$@"Chào {account.FullName},

Chào mừng bạn đến với Phong Linh Class Center! 
Đây là thông tin tài khoản của bạn:

- Email: {account.Email}
- Mật khẩu: {plainPassword} (vui lòng đổi mật khẩu sau khi đăng nhập)

Truy cập hệ thống tại: https://phonglinhclass.com

Trân trọng,
Phong Linh Class Center";

            // Thêm email vào hàng đợi
            EmailBackgroundService.EnqueueEmail(account.Email, subject, message);

            return Ok(new { message = "Account created successfully.", accountId = account.AccountId });
        }


        [HttpGet("{id}")]
        public async Task<IActionResult> GetOfficerList(Guid id)
        {
            var accountList = await _accountRepository.GetAccountListAsync();
            var account = accountList.FirstOrDefault(a => a.AccountId == id);
            var response = _mapper.Map<AccountDTO>(account);
            if (account == null) return NotFound();
            return Ok(response);
        }

    }
}
