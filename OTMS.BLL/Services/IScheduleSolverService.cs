using OTMS.BLL.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OTMS.BLL.Services
{
    public interface IScheduleSolverService
    {
        List<ScheduleItem> SolveSchedule(ScheduleParameters parameters, List<SessionInfo> existingSessions);
    }
}
