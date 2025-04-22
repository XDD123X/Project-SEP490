using OTMS.BLL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OTMS.BLL.DTOs
{
    public class ClassStudentDTO
    {
        public int ClassStudentId { get; set; }

        public Guid ClassId { get; set; }

        public Guid StudentId { get; set; }

        public int? Status { get; set; }
        public virtual AccountDTO Student { get; set; } = null!;
    }
}
