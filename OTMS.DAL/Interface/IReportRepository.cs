using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using OTMS.BLL.Models;


namespace OTMS.DAL.Interface
{
    public interface IReportRepository : IRepository<Report>
    {
        public Task<List<Report>> GetAllReports();
        public Task AddReport(Report report);
        public Report GetReportsWithSessionClassAndGeneratedByReportId(Guid reportId);
        public Report GetReportsWithSessionClassAndGeneratedBySessionId(Guid sessionId);
        Task<Report> GetReportBySessionIdAsync(Guid sessionId);

    }
}
