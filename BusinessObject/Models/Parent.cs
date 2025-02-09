using System;
using System.Collections.Generic;

namespace BusinessObject.Models;

public partial class Parent
{
    public int ParentId { get; set; }

    public int StudentId { get; set; }

    public string FullName { get; set; } = null!;

    public string PhoneNumber { get; set; } = null!;

    public string Email { get; set; } = null!;

    public int? Status { get; set; }

    public virtual Account Student { get; set; } = null!;
}
