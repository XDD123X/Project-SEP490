using Microsoft.EntityFrameworkCore;
using OTMS.BLL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OTMS.DAL.DAO
{
    public class ScheduleDAO : GenericDAO<Account>
    {
        public ScheduleDAO(OtmsContext context) : base(context) { }

        public async Task<bool> AddScheduleAsync(List<Session> sessions)
        {
            // Thêm nhiều Session
            await _context.Sessions.AddRangeAsync(sessions);
            int changes = await _context.SaveChangesAsync();
            return changes > 0;
        }

        public async Task<List<Session>> GetAllSessionsAsync()
        {
            return await _context.Sessions
                .Include(s => s.Class)
                .Include(s => s.Lecturer)
                .Include(s => s.Records)
                .Include(s => s.Files)
                .Include(s => s.Reports)
                .OrderBy(s => s.SessionDate)
                .ThenBy(s => s.Slot)
                .ToListAsync();
        }
        public async Task<List<Session>> GetByLecturerIdAsync(Guid id)
        {
            return await _context.Sessions
                .Where(s => s.LecturerId == id && s.Class.Status != 0)
                .Include(s => s.Records)
                .Include(s => s.Files)
                .Include(s => s.Reports)
                .Include(s => s.Class)
                .Include(s => s.Lecturer)
                .OrderBy(s => s.SessionDate)
                .ThenBy(s => s.Slot)
                .ToListAsync();
        }
        public async Task<List<Session>> GetByStudentIdAsync(Guid id)
        {
            List<Guid> classList = await _context.ClassStudents
                .Where(cs => cs.StudentId.Equals(id))
                .Select(cs => cs.ClassId)
                .ToListAsync();

            //return await _context.Sessions
            //    .Where(s => classList.Contains(s.ClassId))
            //    .Include(s => s.Class)
            //    .Include(s => s.Lecturer)
            //    .Include(s => s.Attendances)
            //    .OrderBy(s => s.SessionDate)
            //    .ThenBy(s => s.Slot)
            //    .ToListAsync();

            var classes = await _context.ClassStudents
                                    .Where(s => s.StudentId == id)
                                    .Include(s => s.Class)
                                    .ToListAsync();

            var sessions = await _context.Sessions
                .Where(s => classList.Contains(s.ClassId) && s.Class.Status == 2)
                .Include(s => s.Records)
                .Include(s => s.Files)
                .Include(s => s.Reports)
                .Include(s => s.Class)
                .Include(s => s.Lecturer)
                .Include(s => s.Attendances)
                .OrderBy(s => s.SessionDate)
                .ThenBy(s => s.Slot)
                .ToListAsync();

            return sessions;

        }

        public async Task<List<Session>> GetByStudentIdAndDateRangeAsync(Guid id, DateTime startDate, DateTime endDate)
        {
            var classIds = await _context.ClassStudents
                .Where(cs => cs.StudentId == id)
                .Select(cs => cs.ClassId)
                .ToListAsync();
            if (!classIds.Any()) return new List<Session>();
            return await _context.Sessions
                .Include(s => s.Class)
                .Include(s => s.Lecturer)
                .Include(s => s.Attendances)
                .Where(s => classIds.Contains(s.ClassId) && s.SessionDate >= startDate && s.SessionDate <= endDate)
                .OrderBy(s => s.SessionDate)
                .ToListAsync();
        }
        public async Task<List<Session>> GetByLecturerIdAndDateRangeAsync(Guid id, DateTime startDate, DateTime endDate)
        {
            return await _context.Sessions
                .Where(s => s.LecturerId.Equals(id) && s.SessionDate >= startDate && s.SessionDate <= endDate)
                .OrderBy(s => s.SessionDate)
                .ToListAsync();
        }
    }
}
