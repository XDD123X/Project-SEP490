using System;
using System.Collections.Generic;

namespace OTMS.BLL.Models;

public partial class Record
{
    public Guid RecordId { get; set; }

    public Guid SessionId { get; set; }

    public string? VideoUrl { get; set; }

    public string? Description { get; set; }

    public Guid? UploadedBy { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public int? Status { get; set; }

    public virtual ICollection<Report> Reports { get; set; } = new List<Report>();

    public virtual Session Session { get; set; } = null!;

    public virtual Account? UploadedByNavigation { get; set; }
}
