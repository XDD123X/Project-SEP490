//using Microsoft.AspNetCore.Mvc;
//using OTMS.API.SolveSchedule;
//using OTMS.BLL.Models;
//using OTMS.DAL.Interface;

//namespace OTMS.API.Controllers
//{

//    //dto
//    public class ScheduleRequestGuid
//    {
//        public List<ClassTeacherPair> Assignments { get; set; } = new();

//        public int TotalWeeks { get; set; }
//        public int DaysPerWeek { get; set; }
//        public int SlotsPerDay { get; set; }
//    }

//    public class ClassTeacherPair
//    {
//        public Guid ClassId { get; set; }
//        public Guid TeacherId { get; set; }
//    }

//    [Route("api/admin/[controller]")]
//    [ApiController]
//    public class SessionController : Controller
//    {
//        private readonly IConfiguration _configuration;
//        private readonly OtmsContext _context;
//        private readonly IScheduleRepository _scheduleRepository;

//        public SessionController(IConfiguration configuration, OtmsContext context, IScheduleRepository scheduleRepository)
//        {
//            _configuration = configuration;
//            _context = context;
//            _scheduleRepository = scheduleRepository;
//        }


//        [HttpPost]
//        public async Task<IActionResult> CreateScheduleAsync([FromBody] ScheduleRequestGuid request)
//        {
//            try
//            {
//                // 1) Lấy class id từ request
//                var classIdsFromRequest = request.Assignments
//                                                .Select(a => a.ClassId)
//                                                .Distinct()
//                                                .ToList();

//                // lay thong tin class from db
//                var classesFromDb = _context.Classes
//                    .Where(c => classIdsFromRequest.Contains(c.ClassId))
//                    .ToList();

//                if (!classesFromDb.Any())
//                {
//                    return BadRequest("Không tìm thấy Class nào khớp với dữ liệu gửi lên.");
//                }

//                // Lấy TeacherId từ request
//                var teacherIdsFromRequest = request.Assignments
//                                                   .Select(a => a.TeacherId)
//                                                   .Distinct()
//                                                   .ToList();

//                // get lecturer
//                var lecturersFromDb = _context.Accounts
//                    .Where(acc => teacherIdsFromRequest.Contains(acc.AccountId))
//                    .ToList();

//                if (!lecturersFromDb.Any())
//                {
//                    return BadRequest("Không tìm thấy giảng viên nào khớp với dữ liệu gửi lên.");
//                }

//                //Tạo mảng classId vs teacherId
//                Guid[] classIds = classesFromDb.Select(c => c.ClassId).ToArray();
//                Guid[] teacherIds = lecturersFromDb.Select(l => l.AccountId).ToArray();


//                // so buoi moi lop can và class id
//                var classSessionCount = classesFromDb.ToDictionary(
//                    c => c.ClassId,
//                    c => c.TotalSession
//                );


//                var teacherOfClass = new Dictionary<Guid, Guid>();
//                foreach (var item in request.Assignments)
//                {
//                    // check class vs lecturer có trong db ko
//                    if (classesFromDb.Any(cls => cls.ClassId == item.ClassId) &&
//                        lecturersFromDb.Any(lec => lec.AccountId == item.TeacherId))
//                    {
//                        teacherOfClass[item.ClassId] = item.TeacherId;
//                    }
//                    else
//                    {
//                        throw new Exception("Ko có class or teacher trong db");
//                    }
//                }

//                // giải tìm danh sách các thằng result
//                var results = ScheduleSlotForPhongLinh.SolveSchedule(
//                    classIds: classIds,
//                    classSessionCount: classSessionCount,
//                    teacherIds: teacherIds,
//                    teacherOfClass: teacherOfClass,
//                    totalWeeks: request.TotalWeeks,
//                    daysPerWeek: request.DaysPerWeek,
//                    slotsPerDay: request.SlotsPerDay
//                );

//                // Chuyển result về dạng session
//                var sessionsToAdd = new List<Session>();

//                foreach (var item in results)
//                {
//                    // Tạo Session
//                    var newSession = new Session
//                    {
//                        SessionId = Guid.NewGuid(),
//                        ClassId = item.ClassId,
//                        LecturerId = item.TeacherId,
//                        SessionDate = item.ActualDate,
//                        Slot = item.Slot,
//                        CreatedAt = DateTime.Now,
//                        UpdatedAt = DateTime.Now,
//                        //update thêm sau
//                    };
//                    sessionsToAdd.Add(newSession);
//                }

//                bool success = true;
//                // luu vao db
//                if (sessionsToAdd.Any())
//                {
//                    success = await _scheduleRepository.AddScheduleAsync(sessionsToAdd);
//                }

//                if (!success)
//                {
//                    return BadRequest("Không thể lưu Session vào DB.");
//                }


//                // tra ra api
//                return Ok(new
//                {
//                    message = "Tạo lịch thành công và đã lưu và db",
//                    totalCreated = sessionsToAdd.Count,
//                    sessions = sessionsToAdd.Select(s => new
//                    {
//                        s.SessionId,
//                        s.ClassId,
//                        s.LecturerId,
//                        s.SessionDate,
//                        s.Slot
//                    })
//                });
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, new { error = ex.Message });
//            }
//        }

//        [HttpGet("all-sessions")]
//        public async Task<IActionResult> GetAllSessions()
//        {
//            try
//            {
//                // Đợi kết quả trước khi Select
//                var sessions = await _scheduleRepository.GetAllSessionsAsync();

//                var result = sessions.Select(s => new
//                {
//                    s.SessionId,
//                    s.SessionDate,
//                    s.Slot,
//                    s.ClassId,
//                    s.Class?.ClassName,
//                    s.LecturerId,
//                    LecturerName = s.Lecturer?.FullName
//                }).ToList();

//                return Ok(result);
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, new { error = ex.Message });
//            }
//        }






//    }
//}
