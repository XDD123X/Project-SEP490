using OTMS.BLL.DTOs;
using OTMS.BLL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OTMS.DAL.Interface
{
    public interface IAttendanceRepository : IRepository<Attendance>
    {
        Task<List<Attendance>> GetBySessionAsync(Guid sessionId);
        Task<List<Attendance>> GetByStudentAndClassAsync(Guid studentId, Guid classId);
        Task AddAttendance(Guid sessionId, List<AttendanceDTO> listStudent);
        Task EditAttendance(Guid sessionId, List<AttendanceDTO> listStudent);
        Task<bool> CheckAbsentAttendance(Guid studentId, Guid classId);

    }
}
