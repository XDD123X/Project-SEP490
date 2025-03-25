using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using OTMS.BLL.DTOs;
using OTMS.BLL.Models;
using OTMS.DAL.Interface;
using OTMS.DAL.Repository;
using System.Linq;

namespace OTMS.API.Controllers.Officer_Endpoint
{
    [Route("api/[controller]")]
    [ApiController]
    public class SessionController : OfficerPolicyController
    {
        private readonly ISessionRepository _sessionRepository;
        private readonly IAccountRepository _accountRepository;
        private readonly IClassRepository _classRepository;
        private readonly IClassSettingRepository _classSettingRepository;
        private readonly ILecturerScheduleRepository _lecturerScheduleRepository;
        private readonly IMapper _mapper;

        public SessionController(
            ISessionRepository sessionRepository, 
            IAccountRepository accountRepository, 
            IClassRepository classRepository, 
            IClassSettingRepository classSettingRepository,
            ILecturerScheduleRepository lecturerScheduleRepository,
            IMapper mapper)
        {
            _sessionRepository = sessionRepository;
            _accountRepository = accountRepository;
            _classRepository = classRepository;
            _classSettingRepository = classSettingRepository;
            _lecturerScheduleRepository = lecturerScheduleRepository;
            _mapper = mapper;
        }

        [HttpPost("generate-schedule")]
        public async Task<IActionResult> GenerateSchedule([FromBody] ClassScheduleRequest request)
        {
            // Validate request
            if (request.StartDate.Date < DateTime.UtcNow.Date)
                return BadRequest(new { Success = false, Message = "StartDate không được trước thời gian hiện tại." });

            // Validate preferred days
            if (request.PreferredDays == null || !request.PreferredDays.Any())
                return BadRequest(new { Success = false, Message = "Vui lòng chọn ít nhất một ngày trong tuần cho lớp học." });

            // Chuyển đổi preferred days sang DayOfWeek (0-6)
            var preferredDaysOfWeek = request.PreferredDays
                .Select(day => (DayOfWeek)((day == 1 ? 0 : day - 1) % 7))
                .ToList();

            // Lấy thông tin class setting hiện tại
            var classSettings = await _classSettingRepository.GetAllAsync();
            var classSetting = classSettings.LastOrDefault();
            
            if (classSetting == null)
                return BadRequest(new { Success = false, Message = "Không tìm thấy cấu hình lớp học." });

            // Lấy thông tin lịch rảnh của giảng viên
            var lecturerSchedule = await _lecturerScheduleRepository.GetByLecturerId(request.LecturerId);
            
            if (lecturerSchedule == null)
                return BadRequest(new { Success = false, Message = "Không tìm thấy lịch rảnh của giảng viên." });

            // Lấy danh sách ngày trong tuần mà giảng viên có thể dạy
            var weekdayAvailable = lecturerSchedule.WeekdayAvailable?.Split(',')
                .Select(int.Parse)
                .Select(day => (DayOfWeek)((day == 8 ? 0 : day - 1) % 7)) // Chuyển đổi 2-8 sang DayOfWeek (0-6)
                .ToList();

            if (weekdayAvailable == null || !weekdayAvailable.Any())
                return BadRequest(new { Success = false, Message = "Giảng viên không có ngày nào trong tuần có thể dạy." });

            // Kiểm tra xem ngày mong muốn học có nằm trong lịch rảnh của giảng viên không
            var validDays = preferredDaysOfWeek.Intersect(weekdayAvailable).ToList();
            
            if (!validDays.Any())
                return BadRequest(new { Success = false, Message = "Không có ngày nào thỏa mãn cả yêu cầu của lớp và lịch rảnh của giảng viên." });

            // Lấy danh sách slot giảng viên có thể dạy
            var slotAvailable = lecturerSchedule.SlotAvailable?.Split(',')
                .Select(int.Parse)
                .ToList();

            if (slotAvailable == null || !slotAvailable.Any())
                return BadRequest(new { Success = false, Message = "Giảng viên không có slot nào có thể dạy." });

            // Lấy class info để kiểm tra tổng số buổi
            var classInfo = await _classRepository.GetByIdAsync(request.ClassId);
            if (classInfo == null)
                return BadRequest(new { Success = false, Message = "Không tìm thấy thông tin lớp học." });

            // Thiết lập các tham số cho việc lập lịch
            var scheduleParams = new ScheduleParameters
            {
                ClassId = request.ClassId,
                LecturerId = request.LecturerId,
                StartDate = request.StartDate,
                EndDate = request.StartDate.AddYears(1), // EndDate là 1 năm sau 
                TotalSessions = request.TotalSessions > 0 ? request.TotalSessions : classInfo.TotalSession,
                SlotsPerDay = classSetting.SlotNumber ?? 4,
                ValidDays = validDays,
                AvailableSlots = slotAvailable,
                MaxSessionsPerWeek = classSetting.SessionPerWeek ?? 2
            };

            // Thông báo cho user các thông tin đã được điều chỉnh
            var scheduleInfo = new {
                StartDate = scheduleParams.StartDate,
                EndDate = scheduleParams.EndDate,
                TotalSessions = scheduleParams.TotalSessions,
                SlotsPerDay = scheduleParams.SlotsPerDay,
                ValidDays = string.Join(", ", scheduleParams.ValidDays.Select(d => d.ToString())),
                AvailableSlots = string.Join(", ", scheduleParams.AvailableSlots),
                MaxSessionsPerWeek = scheduleParams.MaxSessionsPerWeek,
                PreferredDays = string.Join(", ", preferredDaysOfWeek.Select(d => d.ToString())),
                LecturerAvailableDays = string.Join(", ", weekdayAvailable.Select(d => d.ToString()))
            };

            try
            {
                var sessions = await _sessionRepository.GenerateAndSaveScheduleAsync(scheduleParams);
                var lecturer = await _accountRepository.GetByIdAsync(request.LecturerId);
                var classInfor = await _classRepository.GetByIdAsync(request.ClassId);

                var lecturerMap = _mapper.Map<AccountDTO>(lecturer);
                var classMap = _mapper.Map<ClassDTO>(classInfor);

                return Ok(new
                {
                    Success = true,
                    Message = "Lập lịch thành công",
                    Data = sessions.Select(s => new
                    {
                        s.SessionId,
                        Class = classMap,
                        Lecturer = lecturerMap,
                        s.SessionDate,
                        s.Slot,
                        s.Status
                    }),
                    ScheduleInfo = scheduleInfo
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    Success = false,
                    Message = ex.Message
                });
            }
        }

        [HttpGet("All")]
        public async Task<IActionResult> GetAllSession()
        {
            var sessions = await _sessionRepository.GetSessionList();
            if (sessions == null || !sessions.Any())
                return NotFound();

            var response = _mapper.Map<List<SessionDTO>>(sessions);
            return Ok(response);
        }

        [HttpPut("Update")]
        public async Task<IActionResult> UpdateSession(SessionUpdateModel update)
        {
            if (update == null || update.SessionId == Guid.Empty)
            {
                return BadRequest("Invalid session data.");
            }

            var session = await _sessionRepository.GetByIdAsync(update.SessionId);
            if (session == null)
            {
                return NotFound("Session not found.");
            }

            var date = update.SessionDate;
            var slot = update.Slot;
            //Valid Date Lecturer

            //Valid Date Student

            // Cập nhật dữ liệu
            session.ClassId = update.ClassId;
            session.LecturerId = update.LecturerId;
            session.SessionDate = update.SessionDate;
            session.Slot = update.Slot;
            session.Description = update.Description;
            session.SessionRecord = update.SessionRecord;
            session.Type = update.Type;
            session.Status = update.Status;

            await _sessionRepository.UpdateAsync(session);

            return Ok(new { message = "Session updated successfully", session });
        }
    }
}
