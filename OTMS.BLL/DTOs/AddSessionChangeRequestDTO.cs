using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OTMS.BLL.DTOs
{
   public class AddSessionChangeRequestDTO
    {
        public Guid SessionId { get; set; }
        public Guid LecturerId { get; set; }
    }
}
