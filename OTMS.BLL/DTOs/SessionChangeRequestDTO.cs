using OTMS.BLL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OTMS.BLL.DTOs
{
    public class SessionChangeRequestDTO
    {
        public Guid RequestChangeId { get; set; }

        public Guid SessionId { get; set; }

        public Guid LecturerId { get; set; }

        public Guid? ApprovedBy { get; set; }

        public string? Description { get; set; }

        public string? Note { get; set; }

        public DateTime? ApprovedDate { get; set; }

        public int? Status { get; set; }

        public DateTime? CreatedAt { get; set; }

        public DateOnly NewDate { get; set; }

        public int NewSlot { get; set; }

        public DateOnly? OldDate { get; set; }

        public int? OldSlot { get; set; }

        public virtual ByNavigationDTO? ApprovedByNavigation { get; set; }

        public virtual AccountDTO Lecturer { get; set; } = null!;
    }
}
