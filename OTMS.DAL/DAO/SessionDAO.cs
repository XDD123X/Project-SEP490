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

        public async Task<(bool isConflict, string message)> CheckScheduleConflictForSingleSessionAsync(
            Guid classId, Guid lecturerId, DateTime sessionDate, int slot)
        {
            // Kiểm tra trùng lịch với các buổi học khác của giảng viên
            var hasLecturerConflict = await _context.Sessions
                .AnyAsync(s =>
                    s.LecturerId == lecturerId &&
                    s.SessionDate.Date == sessionDate.Date &&
                    s.Slot == slot);

            if (hasLecturerConflict)
            {
                return (true, "Lecturer is already scheduled at this time.");
            }

            // Kiểm tra xem có session nào của lớp này vào cùng thời điểm không
            var hasClassConflict = await _context.Sessions
                .AnyAsync(s =>
                    s.ClassId == classId &&
                    s.SessionDate.Date == sessionDate.Date &&
                    s.Slot == slot);

            if (hasClassConflict)
            {
                return (true, "Class is already scheduled at this time.");
            }

            // Lấy danh sách sinh viên trong lớp
            var studentsInClass = await _context.ClassStudents
                .Where(cs => cs.ClassId == classId)
                .Select(cs => cs.StudentId)
                .ToListAsync();

            if (studentsInClass.Any())
            {
                // Lấy danh sách các lớp học khác mà những sinh viên này tham gia
                var otherClassIds = await _context.ClassStudents
                    .Where(cs => studentsInClass.Contains(cs.StudentId))
                    .Select(cs => cs.ClassId)
                    .Distinct()
                    .ToListAsync();

                // Kiểm tra xem có session nào của các lớp này vào cùng thời điểm
                var hasStudentConflict = await _context.Sessions
                    .AnyAsync(s =>
                        otherClassIds.Contains(s.ClassId) &&
                        s.SessionDate.Date == sessionDate.Date &&
                        s.Slot == slot);

                if (hasStudentConflict)
                {
                    return (true, "Students in the class already have a class scheduled at this time.");
                }
            }

            return (false, "No conflicting sessions found.");
        }

        public async Task<(bool isSuccess, string message)> AddSingleSessionAsync(SessionSingleDTO sessionDTO)
        {
            try
            {
                // Kiểm tra thông tin lớp học
                var classInfo = await _context.Classes.FindAsync(sessionDTO.ClassId);
                if (classInfo == null)
                {
                    return (false, "Class information not found.");
                }

                // Kiểm tra thông tin giảng viên
                var lecturer = await _context.Accounts.FindAsync(sessionDTO.LecturerId);
                if (lecturer == null)
                {
                    return (false, " Lecturer information not found.");
                }

                // Kiểm tra xung đột lịch
                var (isConflict, conflictMessage) = await CheckScheduleConflictForSingleSessionAsync(
                    sessionDTO.ClassId, sessionDTO.LecturerId, sessionDTO.SessionDate, sessionDTO.Slot);

                if (isConflict)
                {
                    return (false, conflictMessage);
                }

                //Get Session Number
                var lastSession = await _context.Sessions
                                    .Where(s => s.ClassId == sessionDTO.ClassId)
                                    .OrderByDescending(s => s.SessionNumber)
                                    .FirstOrDefaultAsync();
                var newSessionNumber = lastSession != null ? lastSession.SessionNumber + 1 : 1;

                // Tạo session mới
                var newSession = new Session
                {
                    SessionId = Guid.NewGuid(),
                    SessionNumber = newSessionNumber ?? 0,
                    ClassId = sessionDTO.ClassId,
                    LecturerId = sessionDTO.LecturerId,
                    SessionDate = sessionDTO.SessionDate,
                    Slot = sessionDTO.Slot,
                    Status = 1, // Active
                    CreatedAt = DateTime.Now,
                    UpdatedAt = DateTime.Now
                };

                // Thêm session vào DB
                await _context.Sessions.AddAsync(newSession);
                await _context.SaveChangesAsync();

                // Cập nhật tổng số buổi học của lớp nếu cần
                if (classInfo.TotalSession < newSessionNumber)
                {
                    classInfo.TotalSession = newSessionNumber ?? 0;
                    _context.Classes.Update(classInfo);
                    await _context.SaveChangesAsync();
                }

                return (true, " Session created successfully.");
            }
            catch (Exception ex)
            {
                return (false, $"Error creating session: {ex.Message}");
            }
        }

        public async Task<bool> ClearSessionsByClassID(Guid classId)
        {
            var sessionsToRemove = await _context.Sessions
                .Where(s => s.ClassId == classId)
                .ToListAsync();

            if (sessionsToRemove.Any())
            {
                _context.Sessions.RemoveRange(sessionsToRemove);
                await _context.SaveChangesAsync();
            }

            return true;
        }
    }
}
