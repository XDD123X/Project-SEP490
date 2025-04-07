using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OTMS.BLL.DTOs
{
    public class AddRecordDTO
    {
        public Guid SessionId { get; set; }

        public string? VideoUrl { get; set; }

        public string? Description { get; set; }

        public Guid? UploadedBy { get; set; }

        public DateTime? CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }

        public int? Status { get; set; }



    }
}
