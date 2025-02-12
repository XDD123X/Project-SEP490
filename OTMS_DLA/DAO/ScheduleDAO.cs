using BusinessObject.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OTMS_DLA.DAO
{
    public class ScheduleDAO : GenericDAO<Account>
    {
        public ScheduleDAO(OtmsContext context) : base(context) { }
    }
}
