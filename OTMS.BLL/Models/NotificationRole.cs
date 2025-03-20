using System;
using System.Collections.Generic;

namespace OTMS.BLL.Models;

public partial class NotificationRole
{
    public Guid NotificationId { get; set; }

    public string RoleName { get; set; } = null!;

    public virtual Notification Notification { get; set; } = null!;
}
