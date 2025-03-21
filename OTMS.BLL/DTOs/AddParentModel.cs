using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OTMS.BLL.DTOs
{
    public class AddParentModel
    {
        public string FullName { get; set; }
        public bool Gender { get; set; }
        public string PhoneNumber { get; set; }
        public string Email { get; set; }
        public bool IsAdd { get; set; }
    }
}
