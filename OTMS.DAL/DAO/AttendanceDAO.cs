using Microsoft.EntityFrameworkCore;
using OTMS.BLL.DTOs;
using OTMS.BLL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace OTMS.DAL.DAO
{
    public class AttendanceDAO : GenericDAO<Attendance>
    {
        public AttendanceDAO(OtmsContext context) : base(context) { }

        public async Task AddAttendance(Guid sessionId, List<AttendanceDTO> listStudent)
        {
            if (listStudent == null || listStudent.Count == 0)
                throw new ArgumentException("Student attendance list cannot be empty.");

            var session = await _context.Sessions.FirstOrDefaultAsync(s => s.SessionId == sessionId);
            if (session == null)
                throw new KeyNotFoundException("Session not found.");

            List<Attendance> attendances = new List<Attendance>();

            foreach (AttendanceDTO student in listStudent)
            {
                Attendance attendance = new Attendance()
                {
                    SessionId = sessionId,
                    StudentId = student.StudentId,
                    Status = student.Status ?? 0,
                    Note = student.Note,
                    AttendanceTime = DateTime.Now,
                    CreatedAt = DateTime.Now,
                };
                attendances.Add(attendance);
            }

            await _dbSet.AddRangeAsync(attendances);

            session.Status = 2;
            session.UpdatedAt = DateTime.Now;

            await _context.SaveChangesAsync();
        }


        public async Task EditAttendance(Guid sessionId, List<AttendanceDTO> listStudent)
        {
            var existingAttendances = await _dbSet.Where(a => a.SessionId == sessionId).ToListAsync();

            foreach (var student in listStudent)
            {
                var attendance = existingAttendances.FirstOrDefault(a => a.StudentId == student.StudentId);
                if (attendance != null)
                {
                    // Check if fields have changed
                    bool isStatusChanged = attendance.Status != (student.Status ?? 0);
                    bool isNoteChanged = !string.Equals(attendance.Note, student.Note, StringComparison.OrdinalIgnoreCase);

                    if (isStatusChanged || isNoteChanged)
                    {
                        attendance.Status = student.Status ?? 0;
                        attendance.Note = student.Note;

                        if (isStatusChanged)
                        {
                            attendance.AttendanceTime = DateTime.Now;
                        }

                        attendance.UpdatedAt = DateTime.Now; // Update timestamp only when there's a change
                    }
                }
            }

            await _context.SaveChangesAsync();
        }
        public async Task<List<Attendance>> GetAttendancesBySessionAsync(Guid sessionId)
        {
            return await _dbSet
                .Where(a => a.SessionId == sessionId)
                .ToListAsync();
        }
        public async Task<List<Attendance>> GetByStudentAndClassAsync(Guid studentId, Guid classId)
        {
            return await _dbSet
                .Where(a => a.StudentId == studentId && a.Session.ClassId == classId)
                .ToListAsync();
        }

        public async Task<bool> CheckAbsentAttendance(Guid studentId, Guid classId)
        {
            //int maxAbsences = 3;
            var studentClass = await _context.Classes.FindAsync(classId);
            int maxAbsences = studentClass.TotalSession / 5;
            var absencesCount = await _dbSet
                .Where(a => a.StudentId == studentId && a.Session.ClassId == classId && a.Status == 0)
                .CountAsync();

            return absencesCount > maxAbsences;
        }

    }
}
