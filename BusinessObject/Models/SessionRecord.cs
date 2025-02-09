using System;
using System.Collections.Generic;

namespace BusinessObject.Models;

public partial class SessionRecord
{
    public int RecordId { get; set; }

    public int SessionId { get; set; }

    public string? VideoUrl { get; set; }

    public string? Description { get; set; }

    public int UploadedBy { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public int? Status { get; set; }

    public virtual Session Session { get; set; } = null!;

    public virtual Account UploadedByNavigation { get; set; } = null!;
}
