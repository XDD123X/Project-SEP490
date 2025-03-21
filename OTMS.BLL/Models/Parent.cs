using System;
using System.Collections.Generic;

namespace OTMS.BLL.Models;

public partial class Parent
{
    public Guid ParentId { get; set; }

    public Guid StudentId { get; set; }

    public string FullName { get; set; } = null!;

    public bool? Gender { get; set; }

    public string? PhoneNumber { get; set; }

    public string? Email { get; set; }

    public int? Status { get; set; }

    public virtual Account Student { get; set; } = null!;
}
