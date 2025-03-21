using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OTMS.BLL.DTOs
{
    public class AddAccountModel
    {
        public string Email { get; set; }
        public string FullName { get; set; }
        public string PhoneNumber { get; set; }
        public DateOnly Dob { get; set; }
        public bool Gender { get; set; }
        public int Status { get; set; }
        public bool Fulltime { get; set; }
        public string Role { get; set; }
    }
}
