using OTMS.BLL.DTOs;
using OTMS.BLL.Services;
using OTMS.BLL.Models;
using OTMS.DAL.DAO;
using OTMS.DAL.Interface;

namespace OTMS.DAL.Repository
{
    public class SessionRepository : Repository<Session>, ISessionRepository
    {
        private readonly SessionDAO _sessionDAO;
        private readonly ClassStudentDAO _classStudentDAO;
        private readonly IScheduleSolverService _scheduleSolverService;

        public SessionRepository(SessionDAO sessionDAO, ClassStudentDAO classStudentDAO, IScheduleSolverService scheduleSolverService)
            : base(sessionDAO)
        {
            _sessionDAO = sessionDAO;
            _scheduleSolverService = scheduleSolverService;
            _classStudentDAO = classStudentDAO;
        }



        public async Task<List<Session>> GenerateAndSaveScheduleAsync(ClassScheduleRequest request)
        {
            //lấy dsach svien trong class đang xếp lịch
            var studentsInClass = await _classStudentDAO.GetStudentInClassAsync(request.ClassId);

            // Lấy tất cả các lớp mà các sinh viên đó tham gia (trừ lớp hiện tại)
            var otherClassIds = await _classStudentDAO.GetOtherClassesOfStudentsAsync(studentsInClass);

            // Lịch đã có của sinh viên
            var existingStudentSessions = await _sessionDAO.GetSessionsByClassIdsAsync(
                otherClassIds, request.StartDate, request.EndDate.Value);

            //lịch đã có của lecturer
            var existingLecturerSessions = await _sessionDAO.GetSessionsByLecturerAsync(
                request.LecturerId, request.StartDate, request.EndDate.Value);

            //ghép 2 lịch vơi snhau
            var existingSessions = existingLecturerSessions.Concat(existingStudentSessions).ToList();

            // Chuyển data sang DTO của BLL
            var existingSessionInfos = existingSessions.Select(s => new SessionInfo
            {
                SessionDate = s.SessionDate,
                Slot = s.Slot
            }).ToList();

            // Gọi service logic để xếp lịch
            var scheduledItems = _scheduleSolverService.SolveSchedule(request, existingSessionInfos);

            // Chuyển DTO về Session model để lưu DB
            var newSessions = scheduledItems.Select(item => new Session
            {
                SessionId = Guid.NewGuid(),
                ClassId = item.ClassId,
                LecturerId = item.TeacherId,
                SessionDate = item.ActualDate,
                Slot = item.Slot,
                Status = 1,
                CreatedAt = DateTime.UtcNow
            }).ToList();

            await _sessionDAO.AddSessionsAsync(newSessions);

            return newSessions;
        }

        public Task<List<Session>> GetSessionList() => _sessionDAO.GetSessionList();
    }
}
