using DocumentFormat.OpenXml.InkML;
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
    public class SessionDAO : GenericDAO<Session>
    {
        public SessionDAO(OtmsContext context) : base(context) { }


        public async Task<List<Session>> GetSessionsByLecturerAsync(Guid lecturerId, DateTime fromDate, DateTime toDate)
        {
            return await _context.Sessions
                .Where(s => s.LecturerId == lecturerId
                         && s.SessionDate.Date >= fromDate.Date
                         && s.SessionDate.Date <= toDate.Date)
                .ToListAsync();
        }

        public async Task<bool> AddSessionsAsync(List<Session> sessions)
        {
            await _context.Sessions.AddRangeAsync(sessions);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<Session>> GetSessionsByClassIdsAsync(List<Guid> classIds, DateTime fromDate, DateTime toDate)
        {
            return await _context.Sessions
                .Where(s => classIds.Contains(s.ClassId)
                            && s.SessionDate.Date >= fromDate.Date
                            && s.SessionDate.Date <= toDate.Date)
                .ToListAsync();
        }

        public async Task<List<Session>> GetSessionList()
        {
            return await _context.Sessions
                .Include(s => s.Lecturer)
                .Include(s => s.Class)
                .Include(s => s.Records)
                .ToListAsync();
        }

        public async Task<List<Session>> GetSessionByStudentId(Guid studentId)
        {

            var classList = await _context.Classes
                .Include(c => c.ClassStudents)
                .ThenInclude(c => c.StudentId == studentId)
                .ToListAsync();
            return null;
        }

        public async Task<bool> UpdateSessionAsync(SessionUpdateModel updatedSession)
        {
            var existingSession = await _context.Sessions.FindAsync(updatedSession.SessionId);
            if (existingSession == null)
                return false;

            // Cập nhật dữ liệu
            existingSession.ClassId = updatedSession.ClassId;
            existingSession.LecturerId = updatedSession.LecturerId;
            existingSession.SessionDate = updatedSession.SessionDate;
            existingSession.Slot = updatedSession.Slot;
            existingSession.Description = updatedSession.Description;
            existingSession.SessionRecord = updatedSession.SessionRecord;
            existingSession.Type = updatedSession.Type;
            existingSession.Status = updatedSession.Status;

            _context.Sessions.Update(existingSession);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteSessionAsync(Guid sessionId)
        {
            var session = await _context.Sessions.FindAsync(sessionId);
            if (session == null)
                return false;

            _context.Sessions.Remove(session);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<Session>> GetSessionsByClassId(Guid classId)
        {
            var session = await _context.Sessions
                .Where(s => s.ClassId == classId)
                .Include(s => s.Records)
                .Include(s => s.Files)
                .Include(s => s.Reports)
                .Include(s => s.Attendances)
                .OrderBy(s => s.SessionDate)
                .ToListAsync();

            return session;
        }

        public async Task<Session?> GetSessionsBySessionId(Guid sessionId)
        {
            var session = await _context.Sessions
                .Where(s => s.SessionId == sessionId)
                .Include(s => s.Attendances)
                .Include(s => s.Records)
                .Include(s => s.Files)
                .Include(s => s.Lecturer)
                .Include(s => s.Class)
                .OrderBy(s => s.SessionDate)
                .FirstOrDefaultAsync();

            return session;
        }

    }
}
