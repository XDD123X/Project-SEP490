using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OTMS.BLL.DTOs
{
    public class LoginDTO
    {
        public string Email { get; set; } = null!;

        public string Password { get; set; } = null!;

        public bool RememberMe { get; set; } = false;


    }
}
