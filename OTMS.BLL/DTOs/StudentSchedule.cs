using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OTMS.BLL.DTOs
{
    public class StudentSchedule
    {
        public Guid ClassId { get; set; }

        public Guid LecturerId { get; set; }

        public DateTime SessionDate { get; set; }

        public int Slot { get; set; }

        public string? Description { get; set; }

        public DateOnly? SessionRecord { get; set; }

        public int? Type { get; set; }

        public int? Status { get; set; }

        public DateTime? CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }
    }
}
