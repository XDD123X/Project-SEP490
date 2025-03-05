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

        public async Task TakeListAttendance(Guid sessionId, List<AttendanceDTO> listStudent)
        {
            List<Attendance> attendances = new List<Attendance>();
            foreach (AttendanceDTO student in listStudent)
            {
                Attendance attendance = new Attendance()
                {
                    SessionId = sessionId,
                    StudentId = student.StudentId,
                    Status = student.isAttendance ? 1 : 0,
                    AttendanceTime = DateTime.Now,
                    CreatedAt = DateTime.Now,
                };
                attendances.Add(attendance);
            }
            await _dbSet.AddRangeAsync(attendances);
        }

        public async Task EditAttendance(Guid sessionId, List<AttendanceDTO> listStudent)
        {
            var existingAttendances = await Task.Run(() => _dbSet.Where(a => a.SessionId == sessionId).ToList());

            foreach (var student in listStudent)
            {
                var attendance = existingAttendances.FirstOrDefault(a => a.StudentId == student.StudentId);
                if (attendance != null)
                {
                    attendance.Status = student.isAttendance ? 1 : 0;
                    attendance.AttendanceTime = DateTime.Now;
                    attendance.UpdatedAt = DateTime.Now;
                }
            }
        }
        public async Task<List<Attendance>> GetAttendancesBySession(Guid sessionId)
        {
            return await Task.Run(() => _dbSet.Where(a => a.SessionId == sessionId).ToList());
        }

    }
}
