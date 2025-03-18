using OTMS.BLL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OTMS.DAL.Interface
{
    public interface ILecturerScheduleRepository
    {
        Task<List<LecturerSchedule>> GetAll();
        Task<LecturerSchedule?> GetById(Guid scheduleId);
        Task<LecturerSchedule?> GetByLecturerId(Guid lecturerId);
        Task<bool> Create(LecturerSchedule model);
        Task<bool> Update(LecturerSchedule update);
        Task<bool> Delete(Guid scheduleId);
    }
}
