using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using OTMS.BLL.DTOs;
using OTMS.BLL.Models;
using OTMS.DAL;

namespace OTMS.DAL.DAO
{
    public class SessionChangeRequestDAO :GenericDAO<SessionChangeRequest>
    {
        private readonly OtmsContext _context;

        public SessionChangeRequestDAO(OtmsContext context) : base(context)
        {
            _context = context;
        }

        public async Task<IEnumerable<SessionChangeRequest>> GetAllRequestsAsync()
        {
            return await _context.SessionChangeRequests
                .Include(r => r.Lecturer)
                .Include(r => r.Officer)
                .ToListAsync();
        }

        public async Task<SessionChangeRequest?> GetRequestByIdAsync(Guid requestChangeId)
        {
            return await _context.SessionChangeRequests
                .Include(r => r.Lecturer)
                .Include(r => r.Officer)
                .FirstOrDefaultAsync(r => r.RequestChangeId == requestChangeId);
        }

        public async Task AddRequestAsync(AddSessionChangeRequestDTO model)
        {
            var request = new SessionChangeRequest
            {
                RequestChangeId = Guid.NewGuid(),
                SessionId = model.SessionId,
                LecturerId = model.LecturerId,
                CreatedAt = DateTime.UtcNow,
                Status = 0
            };

            await _context.SessionChangeRequests.AddAsync(request);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateRequestAsync(UpdateSessionChangeRequestDTO model)
        {
            var request = await _context.SessionChangeRequests.FindAsync(model.RequestChangeId);
            if (request == null) return;

            request.Status = model.Status;
            request.ApprovedBy = model.ApprovedBy;
            request.Description = model.Description;
            request.ApprovedDate = DateTime.UtcNow;

            _context.SessionChangeRequests.Update(request);
            await _context.SaveChangesAsync();
        }
    }
}
