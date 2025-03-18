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
    public class LecturerScheduleRepository : ILecturerScheduleRepository
    {
        private readonly LecturerScheduleDAO _lecturerScheduleDAO;

        public LecturerScheduleRepository(LecturerScheduleDAO lecturerScheduleDAO)
        {
            _lecturerScheduleDAO = lecturerScheduleDAO;
        }

        public async Task<List<LecturerSchedule>> GetAll()
        {
            return await _lecturerScheduleDAO.GetAll();
        }

        public async Task<LecturerSchedule?> GetById(Guid scheduleId)
        {
            return await _lecturerScheduleDAO.GetById(scheduleId);
        }

        public async Task<LecturerSchedule?> GetByLecturerId(Guid lecturerId)
        {
            return await _lecturerScheduleDAO.GetByLecturerId(lecturerId);
        }

        public async Task<bool> Create(LecturerSchedule model)
        {
            return await _lecturerScheduleDAO.Create(model);
        }

        public async Task<bool> Update(LecturerSchedule update)
        {
            return await _lecturerScheduleDAO.Update(update);
        }

        public async Task<bool> Delete(Guid scheduleId)
        {
            return await _lecturerScheduleDAO.Delete(scheduleId);
        }

    }
}
