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
    class ReportRepository : Repository<Report>, IReportRepository
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
    }
}
