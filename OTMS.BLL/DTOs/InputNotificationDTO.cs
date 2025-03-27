using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OTMS.BLL.DTOs
{
    public class InputNotificationDTO
    {
        public string Title { get; set; } = null!;

        public string Content { get; set; } = null!;

        public int? Type { get; set; } = null!;
        public string? Value { get; set; } = null!;
        public bool? EmailSend { get; set; } = false;
    }
}
