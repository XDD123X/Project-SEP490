using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using OTMS.BLL.DTOs;
using OTMS.BLL.Models;
using OTMS.DAL;
using OTMS.BLL.Repositories;
using OTMS.DAL.DAO;
using OTMS.DAL.Repository;

namespace OTMS.DAL.Repositories
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

        public async Task AddRequestAsync(AddSessionChangeRequestDTO model)
        {
            await _sessionChangeRequestDAO.AddRequestAsync(model);
        }

        public async Task UpdateRequestAsync(UpdateSessionChangeRequestDTO model)
        {
            await _sessionChangeRequestDAO.UpdateRequestAsync(model);
        }
    }
}