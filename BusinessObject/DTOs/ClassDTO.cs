using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObject.DTOs
{
    public class ClassDTO
    {
        public Guid ClassId { get; set; }

        public string ClassCode { get; set; } = null!;

        public string ClassName { get; set; } = null!;

        public int CourseId { get; set; }

        public int TotalSession { get; set; }

        public string? ClassUrl { get; set; }

        public int? Status { get; set; }
    }
}
