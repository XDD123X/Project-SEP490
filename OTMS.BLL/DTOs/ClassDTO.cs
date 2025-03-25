using OTMS.API.Controllers.Admin_Endpoint;
using OTMS.BLL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OTMS.BLL.DTOs
{
    public class ClassDTO
    {
        public Guid? ClassId { get; set; } = null!;
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
        public virtual ICollection<ClassStudentDTO> ClassStudents { get; set; } = new List<ClassStudentDTO>();
        public virtual CourseDTO Course { get; set; } = null!;
        public virtual AccountDTO? Lecturer { get; set; }
    }
}
