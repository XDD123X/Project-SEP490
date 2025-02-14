using System;
using System.Collections.Generic;

namespace OTMS.BLL.Models;

public partial class ClassStudent
{
    public int ClassStudentId { get; set; }

    public Guid ClassId { get; set; }

    public Guid StudentId { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public int? Status { get; set; }

    public virtual Class Class { get; set; } = null!;

    public virtual Account Student { get; set; } = null!;
}
