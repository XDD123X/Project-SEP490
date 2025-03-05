using System;
using System.Collections.Generic;

namespace OTMS.BLL.Models;

public partial class ClassSetting
{
    public int SettingId { get; set; }

    public int? SessionPerWeek { get; set; }

    public int SessionTotal { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }
}
