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
        private readonly IScheduleSolverService _scheduleSolverService;

        public SessionRepository(SessionDAO sessionDAO, IScheduleSolverService scheduleSolverService)
            : base(sessionDAO)
        {
            _sessionDAO = sessionDAO;
            _scheduleSolverService = scheduleSolverService;
        }



        public async Task<List<Session>> GenerateAndSaveScheduleAsync(ClassScheduleRequest request)
        {
            var existingSessions = await _sessionDAO.GetSessionsByLecturerAsync(
                request.LecturerId, request.StartDate, request.EndDate);

            // Chuyển data sang DTO của BLL
            var existingSessionInfos = existingSessions.Select(s => new SessionInfo
            {
                SessionDate = s.SessionDate,
                Slot = s.Slot
            }).ToList();

            // Gọi BLL logic để xếp lịch
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
    }
}
