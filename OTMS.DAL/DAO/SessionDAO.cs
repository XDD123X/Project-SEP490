using DocumentFormat.OpenXml.InkML;
using Microsoft.EntityFrameworkCore;
using OTMS.BLL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OTMS.DAL.DAO
{
    public class SessionDAO : GenericDAO<Session>
    {
        public SessionDAO(OtmsContext context) : base(context) { }


        public async Task<List<Session>> GetSessionsByLecturerAsync(Guid lecturerId, DateTime fromDate, DateTime toDate)
        {
            return await _context.Sessions
                .Where(s => s.LecturerId == lecturerId
                         && s.SessionDate.Date >= fromDate.Date
                         && s.SessionDate.Date <= toDate.Date)
                .ToListAsync();
        }

        public async Task<bool> AddSessionsAsync(List<Session> sessions)
        {
            await _context.Sessions.AddRangeAsync(sessions);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<Session>> GetSessionsByClassIdsAsync(List<Guid> classIds, DateTime fromDate, DateTime toDate)
        {
            return await _context.Sessions
                .Where(s => classIds.Contains(s.ClassId)
                            && s.SessionDate.Date >= fromDate.Date
                            && s.SessionDate.Date <= toDate.Date)
                .ToListAsync();
        }



    }
}
