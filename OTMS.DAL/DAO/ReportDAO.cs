using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DocumentFormat.OpenXml.Spreadsheet;
using Microsoft.EntityFrameworkCore;
using OTMS.BLL.Models;

namespace OTMS.DAL.DAO
{
    public class ReportDAO : GenericDAO<Report>
    {
        private readonly OtmsContext _context;

        public ReportDAO(OtmsContext context) : base(context)
        {
            _context = context;
        }

        //public List<Report> GetReportsWithSessionClassAndGeneratedBy(Guid reportId)
        //{
        //    return _context.Reports
        //        .Include(r => r.Session)
        //            .ThenInclude(s => s.Class)
        //        .Include(r => r.GeneratedByNavigation)
        //        .Where(r => r.ReportId == reportId)
        //        .ToList();
        //}
        public Report GetReportsWithSessionClassAndGeneratedByReportId(Guid reportId)
        {
            return _context.Reports
                .Where(r => r.ReportId == reportId)
                .Include(r => r.Session)
                    .ThenInclude(s => s.Class)
                .Include(r => r.GeneratedByNavigation)
                .Select(r => new Report
                {
                    ReportId = r.ReportId,
                    AnalysisData = r.AnalysisData,
                    Session = new Session
                    {
                        SessionDate = r.Session.SessionDate,
                        Slot=r.Session.Slot,
                        Class = new Class
                        {
                            ClassName = r.Session.Class.ClassName
                        }
                    },
                    GeneratedByNavigation = new Account
                    {
                        FullName = r.GeneratedByNavigation.FullName
                    }
                })
                .FirstOrDefault();
        }


        public Report GetReportsWithSessionClassAndGeneratedBySessionId(Guid sessionId)
        {
            return _context.Reports
                .Where(r => r.SessionId == sessionId)
                .Include(r => r.Session)
                    .ThenInclude(s => s.Class)
                .Include(r => r.GeneratedByNavigation)
                .Select(r => new Report
                {
                    ReportId = r.ReportId,
                    AnalysisData = r.AnalysisData,
                    Session = new Session
                    {
                        SessionDate = r.Session.SessionDate,
                        Slot = r.Session.Slot,
                        Class = new Class
                        {
                            ClassName = r.Session.Class.ClassName
                        }
                    },
                    GeneratedByNavigation = new Account
                    {
                        FullName = r.GeneratedByNavigation.FullName
                    }
                })
                .FirstOrDefault();
        }


        public async Task<Report> GetReportBySessionIdAsync(Guid sessionId)
        {
            return await _context.Reports
                .FirstOrDefaultAsync(r => r.SessionId == sessionId);
        }


    }
}
