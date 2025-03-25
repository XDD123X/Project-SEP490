using OTMS.BLL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OTMS.BLL.DTOs
{
    public class ProfileChangeRequestDTO
    {
        public Guid RequestChangeId { get; set; }
        public Guid AccountId { get; set; }

        public string ImgUrlOld { get; set; } = null!;

        public string ImgUrlNew { get; set; } = null!;

        public Guid? ApprovedBy { get; set; }

        public string? Description { get; set; }

        public DateTime? ApprovedDate { get; set; }
        public DateTime? CreatedAt { get; set; }

        public int? Status { get; set; }

        public virtual AccountDTO Account { get; set; } = null!;

        public virtual AccountDTO? ApprovedByNavigation { get; set; }
    }
}
