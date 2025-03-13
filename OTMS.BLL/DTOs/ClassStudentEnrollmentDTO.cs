using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OTMS.BLL.DTOs
{
   public class ClassStudentEnrollmentDTO
    {
        public Guid ClassId { get; set; }
        public string ClassCode { get; set; }
        public string ClassName { get; set; }
        public string CourseName { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Status { get; set; }
    }
}
