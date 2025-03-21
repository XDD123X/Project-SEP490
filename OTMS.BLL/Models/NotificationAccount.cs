using System;
using System.Collections.Generic;

namespace OTMS.BLL.Models;

public partial class NotificationAccount
{
    public Guid NotificationId { get; set; }

    public Guid AccountId { get; set; }

    public bool? IsRead { get; set; }

    public virtual Account Account { get; set; } = null!;

    public virtual Notification Notification { get; set; } = null!;
}
