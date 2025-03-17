using OTMS.BLL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OTMS.BLL.DTOs
{
    public class SessionUpdateModel
    {
        public Guid SessionId { get; set; }

        public Guid ClassId { get; set; }

        public Guid? LecturerId { get; set; }

        public DateTime SessionDate { get; set; }

        public int Slot { get; set; }

        public string? Description { get; set; }

        public DateTime? SessionRecord { get; set; }

        public int? Type { get; set; }

        public int? Status { get; set; }
    }
}
