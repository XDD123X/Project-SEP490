using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OTMS.BLL.DTOs
{
    public class UserUpdateProfile
    {


        public string Email { get; set; } = null!;


        public string FullName { get; set; } = null!;


        public DateTime? UpdatedAt { get; set; }

    }
}
