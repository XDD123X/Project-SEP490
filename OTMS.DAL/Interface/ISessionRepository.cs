using OTMS.BLL.DTOs;
using OTMS.BLL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OTMS.DAL.Interface
{
    public interface ISessionRepository : IRepository<Session>
    {
        Task<List<Session>> GenerateAndSaveScheduleAsync(ScheduleParameters parameters);
        Task<List<Session>> GetSessionList();
        
        Task<bool> UpdateSession(SessionUpdateModel session);
        Task DeleteSessionAsync(Guid sessionId);

        Task<List<Session>> GetSessionsByClassId(Guid classId);
        Task<Session?> GetSessionsBySessionId(Guid sessionId);

        Task<(bool isConflict, string message)> CheckScheduleConflictForSingleSessionAsync(Guid classId, Guid lecturerId, DateTime sessionDate, int slot);
        Task<(bool isSuccess, string message)> AddSingleSessionAsync(SessionSingleDTO sessionDTO);

        Task<bool> ClearClassSessionByClassId(Guid classId);
    }
}
