using BusinessObject.Models;
using Microsoft.EntityFrameworkCore;
using OTMS_DLA.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OTMS_DLA.Repository
{
    public class ScheduleRepository : Repository<Session>, IScheduleRepository
    {
        
        public ScheduleRepository(OtmsContext context) : base(context)
        {
            
        }

        public async Task<bool> AddScheduleAsync(List<Session> sessions)
        {
            // Thêm nhiều Session
            await _context.Sessions.AddRangeAsync(sessions);
            int changes = await _context.SaveChangesAsync();
            return (changes > 0);
        }

        public async Task<List<Session>> GetAllSessionsAsync()
        {
            return await _context.Sessions
                .Include(s => s.Class)
                .Include(s => s.Lecturer)
                .OrderBy(s => s.SessionDate) 
                .ThenBy(s => s.Slot)
                .ToListAsync();
        }
    }
}
