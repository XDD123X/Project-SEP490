using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OTMS.BLL.DTOs
{
    public class ClassAddModel
    {
        public string ClassCode { get; set; } = null!;

        public string ClassName { get; set; } = null!;

        public Guid? LecturerId { get; set; } = Guid.Empty;

        public Guid CourseId { get; set; }

        public int TotalSession { get; set; } = 0;

        public DateTime? StartDate { get; set; }

        public DateTime? EndDate { get; set; } = null;

        public string? ClassUrl { get; set; } = null;

        public int? Status { get; set; }
    }
}
