using System;
using System.Collections.Generic;

namespace BusinessObject.Models;

public partial class Class
{
    public Guid ClassId { get; set; }

    public string ClassCode { get; set; } = null!;

    public string ClassName { get; set; } = null!;

    public int CourseId { get; set; }

    public int TotalSession { get; set; }

    public DateTime? StartDate { get; set; }

    public DateTime? EndDate { get; set; }

    public string? ClassUrl { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public int? Status { get; set; }

    public virtual ICollection<ClassStudent> ClassStudents { get; set; } = new List<ClassStudent>();

    public virtual Course Course { get; set; } = null!;

    public virtual ICollection<Session> Sessions { get; set; } = new List<Session>();
}
