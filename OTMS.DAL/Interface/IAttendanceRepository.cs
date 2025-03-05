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
        Task TakeListAttendance(Guid sessionId, List<AttendanceDTO> listStudent);
        Task EditAttendance(Guid sessionId, List<AttendanceDTO> listStudent);

    }
}
