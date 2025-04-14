using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using OTMS.BLL.Models;
using OTMS.DAL.DAO;
using OTMS.DAL.Interface;

namespace OTMS.DAL.Repository
{
    public class ReportRepository : Repository<Report>, IReportRepository
    {

        private readonly ReportDAO _reportDAO;

        public ReportRepository(ReportDAO reportDAO) : base(reportDAO)
        {
            _reportDAO = reportDAO;
        }

        public async Task<List<Report>> GetAllReports()
        {
            var reports = await _reportDAO.GetAllAsync();
            var reportList = reports.ToList();
            return reportList;
        }


        public Task AddReport(Report report) => _reportDAO.AddAsync(report);


        public Report GetReportsWithSessionClassAndGeneratedByReportId(Guid reportId) =>
            _reportDAO.GetReportsWithSessionClassAndGeneratedByReportId(reportId);

        public Report GetReportsWithSessionClassAndGeneratedBySessionId(Guid sessionId) =>
            _reportDAO.GetReportsWithSessionClassAndGeneratedBySessionId(sessionId);

        public async Task<Report> GetReportBySessionIdAsync(Guid sessionId) =>
            await _reportDAO.GetReportBySessionIdAsync(sessionId);
    }
}
