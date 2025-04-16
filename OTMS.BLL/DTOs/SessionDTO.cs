using OTMS.BLL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using File = OTMS.BLL.Models.File;

namespace OTMS.BLL.DTOs
{
    public class SessionDTO
    {
        public Guid SessionId { get; set; }

        public int? SessionNumber { get; set; }

        public Guid ClassId { get; set; }

        public Guid? LecturerId { get; set; }

        public DateTime SessionDate { get; set; }

        public int Slot { get; set; }

        public string? Description { get; set; }

        public DateTime? SessionRecord { get; set; }

        public int? Type { get; set; }

        public int? Status { get; set; }

        public DateTime? CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }

        public virtual ClassDTO Class { get; set; } = null!;

        public virtual AccountDTO? Lecturer { get; set; }

        public virtual ICollection<AttendanceDTO> Attendances { get; set; } = new List<AttendanceDTO>();
        public virtual ICollection<Record> Records { get; set; } = new List<Record>();
        public virtual ICollection<File> Files { get; set; } = new List<File>();
        public virtual ICollection<Report> Reports { get; set; } = new List<Report>();

    }


}
