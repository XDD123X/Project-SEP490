using OTMS.BLL.DTOs;
using OTMS.BLL.Models;
using OTMS.DAL.DAO;
using OTMS.DAL.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OTMS.DAL.Repository
{
    internal class AttendanceRepository : Repository<Attendance>, IAttendanceRepository
    {
        private readonly AttendanceDAO _attendanceDAO;

        public AttendanceRepository(AttendanceDAO attendanceDAO) : base(attendanceDAO)
        {
            _attendanceDAO = attendanceDAO;
        }

        public Task EditAttendance(Guid sessionId, List<AttendanceDTO> listStudent) => _attendanceDAO.EditAttendance(sessionId, listStudent);
        public Task<List<Attendance>> GetBySessionAsync(Guid sessionId) => _attendanceDAO.GetAttendancesBySession(sessionId);
        public Task TakeListAttendance(Guid sessionId, List<AttendanceDTO> listStudent) => _attendanceDAO.TakeListAttendance(sessionId, listStudent);
    }
}
