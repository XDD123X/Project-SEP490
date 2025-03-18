using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OTMS.BLL.DTOs
{
    public class LecturerScheduleUpdateModel
    {
        public Guid? ScheduleId { get; set; }
        public Guid LecturerId { get; set; }

        public string? SlotAvailable { get; set; }

        public string? WeekdayAvailable { get; set; }

    }
}
