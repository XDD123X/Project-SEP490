using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OTMS.BLL.DTOs
{
    public class ParentDTO
    {
        public string StudentAccountId { get; set; }
        public string StudentEmail { get; set; }
        public string StudentFullName { get; set; }
        public string ParentFullName { get; set; }
        public string ParentGender { get; set; }
        public string ParentPhoneNumber { get; set; }
        public string ParentEmail { get; set; }
    }
}
