using Microsoft.EntityFrameworkCore;
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
    public class ScheduleRepository : Repository<Session>, IScheduleRepository
    {
        private readonly ScheduleDAO _scheduleDAO;
        public ScheduleRepository(ScheduleDAO scheduleDAO) : base(scheduleDAO)
        {
            _scheduleDAO = scheduleDAO;
        }


        public async Task<bool> AddScheduleAsync(List<Session> sessions) => await _scheduleDAO.AddScheduleAsync(sessions);

        public async Task<List<Session>> GetAllSessionsAsync() => await _scheduleDAO.GetAllSessionsAsync();

        public async Task<List<Session>> GetByLecturerIdAsync(Guid id) => await _scheduleDAO.GetByLecturerIdAsync(id);

        public async Task<List<Session>> GetByStudentIdAndDateRangeAsync(Guid id, DateTime startDate, DateTime endDate) => await _scheduleDAO.GetByStudentIdAndDateRangeAsync(id, startDate, endDate);

        public async Task<List<Session>> GetByStudentIdAsync(Guid id) => await _scheduleDAO.GetByStudentIdAsync(id);
        public async Task<List<Session>> GetByLecturerIdAndDateRangeAsync(Guid id, DateTime startDate, DateTime endDate) => await _scheduleDAO.GetByLecturerIdAndDateRangeAsync(id, startDate, endDate);
    }
}
