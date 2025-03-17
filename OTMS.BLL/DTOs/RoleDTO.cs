using OTMS.BLL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OTMS.BLL.DTOs
{
    public class RoleDTO
    {
        public string Name { get; set; } = null!;

        public string? Description { get; set; }
    }
}
