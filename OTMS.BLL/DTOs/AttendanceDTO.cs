using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OTMS.BLL.DTOs
{
    public class AttendanceDTO
    {
        public Guid StudentId { get; set; }
        public bool isAttendance { get; set; }
    }
}
