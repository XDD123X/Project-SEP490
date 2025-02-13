﻿using OTMS.BLL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OTMS.DAL.Interface
{
    public interface IScheduleRepository : IRepository<Session>
    {
        Task<bool> AddScheduleAsync(List<Session> sessions);

        Task<List<Session>> GetAllSessionsAsync();
    }
}
