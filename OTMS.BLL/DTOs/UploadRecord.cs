using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OTMS.BLL.DTOs
{
    public class UploadRecord
    {
        public Guid SessionId { get; set; }
        public string? VideoUrl { get; set; }
        public string? Description { get; set; }

    }
}
