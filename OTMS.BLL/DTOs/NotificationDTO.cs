using OTMS.BLL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OTMS.BLL.DTOs
{
    public class NotificationDTO
    {
        public Guid NotificationId { get; set; }

        public string Title { get; set; } = null!;

        public string Content { get; set; } = null!;

        public int? Type { get; set; }

        public Guid CreatedBy { get; set; }

        public DateTime? CreatedAt { get; set; }

        public virtual ByNavigationDTO CreatedByNavigation { get; set; } = null!;
    }
}
