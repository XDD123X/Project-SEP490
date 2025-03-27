using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OTMS.BLL.DTOs
{
    public class UpdateProfileChangeRequestModel
    {
        public Guid RequestChangeId { get; set; }

        public Guid? ApprovedBy { get; set; }

        public string? Description { get; set; }

        public int? Status { get; set; }

    }
}
