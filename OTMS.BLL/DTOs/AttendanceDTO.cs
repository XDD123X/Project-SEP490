using OTMS.BLL.Models;
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

        public int? Status { get; set; }

        public string? Note { get; set; }
    }
}
