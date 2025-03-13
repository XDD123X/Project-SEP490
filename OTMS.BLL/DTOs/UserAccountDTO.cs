using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OTMS.BLL.DTOs
{
    public class UserAccountDTO
    {
        public string? FullName { get; set; }
        public string? Email { get; set; }
        public string? Role { get; set; }
        public string? Password { get; set; }
        public string? PhoneNumber { get; set; }
        public DateOnly? Dob { get; set; }
    }

}
