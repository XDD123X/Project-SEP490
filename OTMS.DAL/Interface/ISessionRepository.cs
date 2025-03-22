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

    }
}
