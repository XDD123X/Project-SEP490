using BusinessObject.Models;
using Microsoft.EntityFrameworkCore;
using OTMS_DLA.DAO;
using OTMS_DLA.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OTMS_DLA.Repository
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
    }
}
