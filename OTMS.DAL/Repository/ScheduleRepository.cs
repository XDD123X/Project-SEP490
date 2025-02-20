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

        public async Task<List<Session>> GetByStudentIdAsync(Guid id) => await _scheduleDAO.GetByStudentIdAsync(id);
    }
}
