using System;

namespace OTMS.BLL.DTOs
{
    public class UpdateSessionChangeRequestDTO
    {
        public Guid RequestChangeId { get; set; }
        public int Status { get; set; }
        public Guid? ApprovedBy { get; set; }
        public string? Description { get; set; }
        public DateTime? ApprovedDate { get; set; }
    }
}
