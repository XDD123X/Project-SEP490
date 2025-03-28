using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
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



    }
}
