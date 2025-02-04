using System;
using System.Collections.Generic;

namespace BusinessObject.Models;

public partial class Session
{
    public Guid SessionId { get; set; }

    public Guid ScheduleId { get; set; }

    public Guid UserId { get; set; }

    public Guid RoleId { get; set; }

    public DateTime SessionDate { get; set; }

    public int? Status { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual Role Role { get; set; } = null!;

    public virtual Schedule Schedule { get; set; } = null!;

    public virtual ICollection<SessionRecord> SessionRecords { get; set; } = new List<SessionRecord>();

    public virtual User User { get; set; } = null!;
}
