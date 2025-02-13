using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OTMS.BLL.DTOs
{
    public partial class ScheduleItem
    {
        public Guid ClassId { get; set; }
        public Guid TeacherId { get; set; }
        public int Week { get; set; }
        public int Day { get; set; }
        public int Slot { get; set; }
        public DateTime ActualDate { get; set; }
    }
}
