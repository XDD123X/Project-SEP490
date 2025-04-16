using System;
using System.Collections.Generic;

namespace OTMS.BLL.Models;

public partial class File
{
    public Guid FileId { get; set; }

    public Guid SessionId { get; set; }

    public string? FileName { get; set; }

    public string? FileUrl { get; set; }

    public string? FileSize { get; set; }

    public string? Description { get; set; }

    public Guid? UploadedBy { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public int? Status { get; set; }

    public virtual Session Session { get; set; } = null!;

    public virtual Account? UploadedByNavigation { get; set; }
}
