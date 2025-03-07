using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OTMS.BLL.DTOs
{
    public class ClassScheduleRequest
    {
        public Guid ClassId { get; set; }
        public Guid LecturerId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int TotalSessions { get; set; }
        public int SlotsPerDay { get; set; } 
        public List<DayOfWeek> PreferredDays { get; set; } 
    }
}
