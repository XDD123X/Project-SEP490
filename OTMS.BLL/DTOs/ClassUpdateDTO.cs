using OTMS.API.Controllers.Admin_Endpoint;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OTMS.BLL.DTOs
{
    public class ClassUpdateDTO
    {
        public Guid ClassId { get; set; }
        public string ClassCode { get; set; } = null!;

        public string ClassName { get; set; } = null!;

        public Guid? LecturerId { get; set; }

        public Guid CourseId { get; set; }

        public int TotalSession { get; set; }

        public DateTime? StartDate { get; set; }

        public DateTime? EndDate { get; set; }

        public string? ClassUrl { get; set; }

        public bool? Scheduled { get; set; }

        public int? Status { get; set; }
    }
}
