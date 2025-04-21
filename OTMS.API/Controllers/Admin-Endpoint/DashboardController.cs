using DocumentFormat.OpenXml.Spreadsheet;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using OTMS.DAL.Interface;

namespace OTMS.API.Controllers.Admin_Endpoint
{
    [Route("api/admin/[controller]")]
    [ApiController]
    public class DashboardController : ControllerBase
    {
        private readonly IAccountRepository _accountRepository;
        private readonly IClassRepository _classRepository;
        private readonly ICourseRepository _courseRepository;
        private readonly IClassSettingRepository _classSettingRepository;
        private readonly IReportRepository _reportRepository;
        private readonly ISessionRepository _sessionRepository;

        public DashboardController(IAccountRepository accountRepository, IClassRepository classRepository, ICourseRepository courseRepository, IClassSettingRepository classSettingRepository, IReportRepository reportRepository, ISessionRepository sessionRepository)
        {
            _accountRepository = accountRepository;
            _classRepository = classRepository;
            _courseRepository = courseRepository;
            _classSettingRepository = classSettingRepository;
            _reportRepository = reportRepository;
            _sessionRepository = sessionRepository;
        }

        [HttpGet("accounts")]
        public async Task<IActionResult> GetAccountStatistics()
        {
            //all data
            var students = await _accountRepository.GetStudentList();
            var officers = await _accountRepository.GetOfficerList();
            var lecturers = await _accountRepository.GetLecturerList();
            var courses = await _courseRepository.GetCourses();
            var classes = await _classRepository.GetClassList();

            //params
            var now = DateTime.Now;
            var thisMonth = new DateTime(now.Year, now.Month, 1);
            var lastMonth = thisMonth.AddDays(-1);
            var lastMonthStart = new DateTime(lastMonth.Year, lastMonth.Month, 1);
            var lastMonthEnd = thisMonth.AddDays(-1);

            //filter data
            var studentsTM = students.Where(s => s.CreatedAt >= thisMonth).ToList();
            var studentsLM = students.Where(s => s.CreatedAt >= lastMonthStart && s.CreatedAt <= lastMonthEnd).ToList();

            var lecturersTM = lecturers.Where(s => s.CreatedAt >= thisMonth).ToList();
            var lecturersLM = lecturers.Where(s => s.CreatedAt >= lastMonthStart && s.CreatedAt <= lastMonthEnd).ToList();

            var officersTM = officers.Where(s => s.CreatedAt >= thisMonth).ToList();
            var officersLM = officers.Where(s => s.CreatedAt >= lastMonthStart && s.CreatedAt <= lastMonthEnd).ToList();

            var coursesTM = courses.Where(s => s.CreatedAt >= thisMonth).ToList();
            var coursesLM = courses.Where(s => s.CreatedAt >= lastMonthStart && s.CreatedAt <= lastMonthEnd).ToList();

            var classesTM = classes.Where(s => s.CreatedAt >= thisMonth).ToList();
            var classesLM = classes.Where(s => s.CreatedAt >= lastMonthStart && s.CreatedAt <= lastMonthEnd).ToList();


            var result = new
            {
                Student = new
                {
                    count = students.Count,
                    change = CalculateChangePercent(studentsTM.Count, studentsLM.Count)
                },
                Lecturer = new
                {
                    count = lecturers.Count,
                    change = CalculateChangePercent(lecturersTM.Count, lecturersLM.Count)
                },
                Officer = new
                {
                    count = officers.Count,
                    change = CalculateChangePercent(officersTM.Count, officersLM.Count)
                },
                Course = new
                {
                    count = courses.Count,
                    change = CalculateChangePercent(coursesTM.Count, coursesLM.Count)
                },
                Class = new
                {
                    count = classes.Count,
                    change = CalculateChangePercent(classesTM.Count, classesLM.Count)
                }
            };


            return Ok(result);
        }

        [HttpGet("reports")]
        public async Task<IActionResult> GetReportStatistics()
        {
            var today = DateTime.Today;

            //get session of today
            var sessions = await _sessionRepository.GetAllAsync();
            var todaySessions = sessions.Where(s => s.SessionDate == today).ToList();

            return Ok(todaySessions);
        }
        private double CalculateChangePercent(int current, int previous)
        {
            if (previous == 0)
                return current == 0 ? 0 : 100;

            return Math.Round(((double)(current - previous) / previous) * 100, 1);
        }

    }
}
