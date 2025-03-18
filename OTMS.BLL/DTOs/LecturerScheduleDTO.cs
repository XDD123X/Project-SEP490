using OTMS.BLL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OTMS.BLL.DTOs
{
    public class LecturerScheduleDTO
    {
        public Guid ScheduleId { get; set; }

        public Guid LecturerId { get; set; }

        public string? SlotAvailable { get; set; }

        public string? WeekdayAvailable { get; set; }

        public DateTime? UpdatedAt { get; set; }

        public virtual AccountDTO Lecturer { get; set; } = null!;
    }
}
