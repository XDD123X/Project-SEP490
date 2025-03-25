using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OTMS.BLL.DTOs
{
    public class UpdateProfileDTO
    {
        public string FullName { get; set; }
        public string Phone { get; set; }
        public DateOnly Dob { get; set; }
        public string? ImgUrl { get; set; } = null;
        public string? MeetUrl { get; set; } = null;
    }
}
