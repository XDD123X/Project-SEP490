using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObject.DTOs
{
    public class AccountUpdate
    {
        public string? FullName { get; set; }
        public string? Email { get; set; }
        public Guid? RoleId { get; set; }
        public string? Password { get; set; }
        public string? PhoneNumber { get; set; }
        public int? Status { get; set; }
    }
}
