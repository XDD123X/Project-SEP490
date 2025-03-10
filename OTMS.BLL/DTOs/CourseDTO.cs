namespace OTMS.API.Controllers.Admin_Endpoint
{
    public class CourseDTO
    {
        public string CourseName { get; set; } = null!;

        public string? Description { get; set; }

        public DateTime? CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }

        public int? Status { get; set; }
    }
}
