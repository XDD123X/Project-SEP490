using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObject.DTOs
{
    public class ResetPasswordRequestDTO
    {
       
          //  public string Email { get; set; }
            public string Code { get; set; }
            public string NewPassword { get; set; }
        
    }
}
