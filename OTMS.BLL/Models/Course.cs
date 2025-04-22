using System;
using System.Collections.Generic;

namespace OTMS.BLL.Models;

public partial class Course
{
    public Guid CourseId { get; set; }

    public string CourseName { get; set; } = null!;

    public string? Description { get; set; }

    public Guid? CreatedBy { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public int? Status { get; set; }

    public virtual ICollection<Class> Classes { get; set; } = new List<Class>();

    public virtual Account? CreatedByNavigation { get; set; }
}
