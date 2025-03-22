using Microsoft.EntityFrameworkCore;
using OTMS.BLL.DTOs;
using OTMS.BLL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OTMS.DAL.DAO
{
    public class ProfileChangeRequestDAO
    {
        private readonly OtmsContext _context;

        public ProfileChangeRequestDAO(OtmsContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ProfileChangeRequest>> GetAllRequestsAsync()
        {
            return await _context.ProfileChangeRequests
                .Include(r => r.Account)
                .Include(r => r.ApprovedByNavigation)
                .ToListAsync();
        }

        public async Task<ProfileChangeRequest?> GetRequestByStudentIdAsync(Guid studentId)
        {
            return await _context.ProfileChangeRequests
                .Where(r => r.AccountId == studentId)
                .Include(r => r.Account)
                .Include(r => r.ApprovedByNavigation)
                .FirstOrDefaultAsync();
        }

        public async Task<ProfileChangeRequest?> GetLastRequestByStudentIdAsync(Guid studentId)
        {
            return await _context.ProfileChangeRequests
                .Where(r => r.AccountId == studentId)
                .OrderByDescending(r => r.CreatedAt)
                .Include(r => r.Account)
                .Include(r => r.ApprovedByNavigation)
                .FirstOrDefaultAsync();
        }

        public async Task<IEnumerable<ProfileChangeRequest>> GetRequestByOfficerIdAsync(Guid officerId)
        {
            return await _context.ProfileChangeRequests
                .Where(r => r.ApprovedBy == officerId)
                .Include(r => r.Account)
                .Include(r => r.ApprovedByNavigation)
                .ToListAsync();
        }

        public async Task AddRequestAsync(AddProfileChangeRequestModel model)
        {
            var request = new ProfileChangeRequest
            {
                RequestChangeId = Guid.NewGuid(),
                AccountId = model.AccountId,
                ImgUrlOld = model.ImgUrlOld,
                ImgUrlNew = model.ImgUrlNew,
                CreatedAt = DateTime.UtcNow,
                Status = 0
            };

            await _context.ProfileChangeRequests.AddAsync(request);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateRequestAsync(UpdateProfileChangeRequestModel model)
        {
            var request = await _context.ProfileChangeRequests.FindAsync(model.RequestChangeId);
            if (request == null) return;

            request.Status = model.Status;
            request.ApprovedBy = model.ApprovedBy;
            request.Description = model.Description;
            request.ApprovedDate = DateTime.Now;

            _context.ProfileChangeRequests.Update(request);
            await _context.SaveChangesAsync();
        }
    }
}
