using System;
using System.Collections.Generic;

namespace BusinessObject.Models;

public partial class ClassStudent
{
    public int ClassStudentId { get; set; }

    public int ClassId { get; set; }

    public int StudentId { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public int? Status { get; set; }

    public virtual Class Class { get; set; } = null!;

    public virtual Account Student { get; set; } = null!;
}
