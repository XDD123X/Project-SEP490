﻿using OTMS.BLL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OTMS.DAL.DAO
{
    public class NotificationDAO : GenericDAO<Notification>
    {
        public NotificationDAO(OtmsContext context) : base(context) { }
    }
}
