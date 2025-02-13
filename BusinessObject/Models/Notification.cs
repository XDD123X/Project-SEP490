using System;
using System.Collections.Generic;

namespace OTMS.BLL.Models;

public partial class Notification
{
    public Guid NotificationId { get; set; }

    public string Title { get; set; } = null!;

    public string Content { get; set; } = null!;

    public Guid CreatedBy { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual Account CreatedByNavigation { get; set; } = null!;
}
