using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using OTMS.BLL.DTOs;
using OTMS.BLL.Models;
using OTMS.DAL;
using OTMS.DAL.Interface;
using OTMS.DAL.DAO;

namespace OTMS.DAL.Repository
{
    public class SessionChangeRequestRepository : Repository<SessionChangeRequest>, ISessionChangeRequestRepository
    {
        private readonly SessionChangeRequestDAO _sessionChangeRequestDAO;

        public SessionChangeRequestRepository(SessionChangeRequestDAO sessionChangeRequestDAO) : base(sessionChangeRequestDAO)
        {
            _sessionChangeRequestDAO = sessionChangeRequestDAO;
        }

        public async Task<IEnumerable<SessionChangeRequest>> GetAllRequestsAsync()
        {
            return await _sessionChangeRequestDAO.GetAllRequestsAsync();
        }

        public async Task<SessionChangeRequest?> GetRequestByIdAsync(Guid id)
        {
            return await _sessionChangeRequestDAO.GetRequestByIdAsync(id);
        }

        public async Task<(bool isSuccess, string message)> AddRequestAsync(AddSessionChangeRequestDTO model)
        {
            return await _sessionChangeRequestDAO.AddRequestAsync(model);
        }

        public async Task<(bool isSuccess, string message)> UpdateRequestAsync(UpdateSessionChangeRequestDTO model)
        {
            return await _sessionChangeRequestDAO.UpdateRequestAsync(model);
        }

        public async Task<IEnumerable<SessionChangeRequest>> GetRequestsByLecturerIdAsync(Guid lecturerId)
        {
            return await _sessionChangeRequestDAO.GetRequestsByLecturerIdAsync(lecturerId);
        }

        public async Task<IEnumerable<SessionChangeRequest>> GetPendingRequestsAsync()
        {
            return await _sessionChangeRequestDAO.GetPendingRequestsAsync();
        }

        public async Task<(bool isConflict, string message)> CheckScheduleConflictAsync(Guid lecturerId, DateTime newDate, int newSlot, Guid? excludeSessionId = null)
        {
            return await _sessionChangeRequestDAO.CheckScheduleConflictAsync(lecturerId, newDate, newSlot, excludeSessionId);
        }
    }
}