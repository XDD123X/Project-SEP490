using OTMS.BLL.Models;
using OTMS.DAL.DAO;
using OTMS.DAL.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OTMS.DAL.Repository
{
    public class SessionRepository : Repository<Session>, ISessionRepository
    {
        private readonly SessionDAO _sessionDAO;

        public SessionRepository(SessionDAO sessionDAO) : base(sessionDAO) {
        
            _sessionDAO = sessionDAO;
        }

        public async Task<bool> AddSessionsAsync(List<Session> sessions)
            => await _sessionDAO.AddSessionsAsync(sessions);

        public async Task<List<Session>> GetSessionsByLecturerAsync(Guid lecturerId, DateTime fromDate, DateTime toDate)
             => await _sessionDAO.GetSessionsByLecturerAsync(lecturerId, fromDate, toDate);
    }
}
