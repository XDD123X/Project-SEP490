using System;
using System.Collections.Generic;

namespace BusinessObject.Models;

public partial class Course
{
    public int CourseId { get; set; }

    public string CourseName { get; set; } = null!;

    public string? Description { get; set; }

    public Guid CreatedBy { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public int? Status { get; set; }

    public virtual ICollection<Class> Classes { get; set; } = new List<Class>();

    public virtual Account CreatedByNavigation { get; set; } = null!;
}
