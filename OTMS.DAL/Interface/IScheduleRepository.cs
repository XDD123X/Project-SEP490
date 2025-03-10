using OTMS.BLL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OTMS.DAL.Interface
{
    public interface IScheduleRepository : IRepository<Session>
    {
        Task<bool> AddScheduleAsync(List<Session> sessions);

        Task<List<Session>> GetAllSessionsAsync();
        Task<List<Session>> GetByLecturerIdAsync(Guid id);
        Task<List<Session>> GetByStudentIdAsync(Guid id);
        Task<List<Session>> GetByStudentIdAndDateRangeAsync(Guid id, DateTime startDate, DateTime endDate);
        Task<List<Session>> GetByLecturerIdAndDateRangeAsync(Guid id, DateTime startDate, DateTime endDate);
    }
}
