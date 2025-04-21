using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OTMS.BLL.DTOs
{
    public class ClassScheduleRequest
    {
        // Thông tin cơ bản
        public Guid ClassId { get; set; }
        public Guid LecturerId { get; set; }
        public DateTime StartDate { get; set; }

        // Setting
        public int TotalSessions { get; set; }
        public int? SessionPerWeek { get; set; }
        public int? SlotNumber { get; set; }

        // Ngày mong muốn học (thứ 2, thứ 3, v.v.)
        public List<int>? PreferredDays { get; set; }
    }
}
