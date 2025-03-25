using OTMS.BLL.DTOs;
using OTMS.BLL.Models;

namespace OTMS.API.Controllers.Admin_Endpoint
{
    public class CourseDTO
    {
        public Guid CourseId { get; set; }
        public string CourseName { get; set; } = null!;

        public string? Description { get; set; }

        public Guid CreatedBy { get; set; }

        public DateTime? CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }

        public int? Status { get; set; }

        public virtual ByNavigationDTO CreatedByNavigation { get; set; } = null!;

    }
}
