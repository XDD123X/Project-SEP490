using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OTMS.BLL.DTOs
{
    public class ByNavigationDTO
    {
    
        public string Email { get; set; } = null!;

        public string FullName { get; set; } = null!;

        public string? PhoneNumber { get; set; }

        public bool? Gender { get; set; }

        public virtual RoleDTO Role { get; set; } = null!;
    }
}
