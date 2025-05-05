using OTMS.BLL.DTOs;
using OTMS.BLL.Services;
using OTMS.BLL.Models;
using OTMS.DAL.DAO;
using OTMS.DAL.Interface;
using DocumentFormat.OpenXml.VariantTypes;

namespace OTMS.DAL.Repository
{
    public class SessionRepository : Repository<Session>, ISessionRepository
    {
        private readonly SessionDAO _sessionDAO;
        private readonly ClassStudentDAO _classStudentDAO;
        private readonly IScheduleSolverService _scheduleSolverService;
        private readonly ClassDAO _classDAO;
        private readonly ClassSettingDAO _classSettingDAO;

        public SessionRepository(ClassDAO classDAO, SessionDAO sessionDAO, ClassStudentDAO classStudentDAO, IScheduleSolverService scheduleSolverService, ClassSettingDAO classSettingDAO)
            : base(sessionDAO)
        {
            _sessionDAO = sessionDAO;
            _scheduleSolverService = scheduleSolverService;
            _classStudentDAO = classStudentDAO;
            _classDAO = classDAO;
            _classSettingDAO = classSettingDAO;
        }

        public async Task<List<Session>> GenerateAndSaveScheduleAsync(ScheduleParameters parameters)
        {
            //lấy dsach svien trong class đang xếp lịch
            var studentsInClass = await _classStudentDAO.GetStudentInClassAsync(parameters.ClassId);

            // Lấy tất cả các lớp mà các sinh viên đó tham gia (trừ lớp hiện tại)
            var otherClassIds = await _classStudentDAO.GetOtherClassesOfStudentsAsync(studentsInClass);

            // Lịch đã có của sinh viên
            var existingStudentSessions = await _sessionDAO.GetSessionsByClassIdsAsync(
                otherClassIds, parameters.StartDate, parameters.EndDate);

            //lịch đã có của lecturer
            var existingLecturerSessions = await _sessionDAO.GetSessionsByLecturerAsync(
                parameters.LecturerId, parameters.StartDate, parameters.EndDate);

            //ghép 2 lịch vơi snhau
            var existingSessions = existingLecturerSessions.Concat(existingStudentSessions).ToList();

            // Chuyển data sang DTO của BLL
            var existingSessionInfos = existingSessions.Select(s => new SessionInfo
            {
                SessionDate = s.SessionDate,
                Slot = s.Slot
            }).ToList();

            // Gọi service logic để xếp lịch với ràng buộc số buổi mỗi tuần
            var scheduledItems = _scheduleSolverService.SolveSchedule(parameters, existingSessionInfos);

            // Chuyển DTO về Session model để lưu DB
            var newSessions = scheduledItems.Select((item, index) => new Session
            {
                SessionId = Guid.NewGuid(),
                SessionNumber = index + 1, // add session number
                ClassId = item.ClassId,
                LecturerId = item.TeacherId,
                SessionDate = item.ActualDate,
                Slot = item.Slot,
                Status = 1,
                CreatedAt = DateTime.Now
            }).ToList();

            await _sessionDAO.AddSessionsAsync(newSessions);

            //Update Class Scheduled to true
            var classSelected = await _classDAO.UpdateClassScheduled(parameters.ClassId);

            return newSessions;
        }

        public Task<List<Session>> GetSessionList() => _sessionDAO.GetSessionList();

        public Task<bool> UpdateSession(SessionUpdateModel session) => _sessionDAO.UpdateSessionAsync(session);

        public Task DeleteSessionAsync(Guid sessionId) => _sessionDAO.DeleteSessionAsync(sessionId);

        public Task<List<Session>> GetSessionsByClassId(Guid classId) => _sessionDAO.GetSessionsByClassId(classId);

        public Task<Session?> GetSessionsBySessionId(Guid sessionId) => _sessionDAO.GetSessionsBySessionId(sessionId);

        public async Task<(bool isConflict, string message)> CheckScheduleConflictForSingleSessionAsync(Guid classId, Guid lecturerId, DateTime sessionDate, int slot)
        {
            return await _sessionDAO.CheckScheduleConflictForSingleSessionAsync(classId, lecturerId, sessionDate, slot);
        }

        public async Task<(bool isSuccess, string message)> AddSingleSessionAsync(SessionSingleDTO sessionDTO)
        {
            return await _sessionDAO.AddSingleSessionAsync(sessionDTO);
        }

        public Task<bool> ClearClassSessionByClassId(Guid classId) => _sessionDAO.ClearSessionsByClassID(classId);
    }
}
