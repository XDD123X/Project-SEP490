using System;
using System.Collections.Generic;

namespace OTMS.BLL.Models;

public partial class Notification
{
    public Guid NotificationId { get; set; }

    public string Title { get; set; } = null!;

    public string Content { get; set; } = null!;

    public int? Type { get; set; }

    public Guid? CreatedBy { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual Account? CreatedByNavigation { get; set; }

    public virtual ICollection<NotificationAccount> NotificationAccounts { get; set; } = new List<NotificationAccount>();

    public virtual ICollection<NotificationRole> NotificationRoles { get; set; } = new List<NotificationRole>();
}
