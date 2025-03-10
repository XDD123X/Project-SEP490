using Google.OrTools.Sat;
using OTMS.BLL.DTOs;
using System.Linq;

namespace OTMS.BLL.Services
{
    public class ScheduleSolverService : IScheduleSolverService
    {
        public List<ScheduleItem> SolveSchedule(ClassScheduleRequest request, List<SessionInfo> existingSessions)
        {
            var existingSlots = existingSessions
                .Select(s => (s.SessionDate.Date, s.Slot))
                .ToHashSet();

            var availableDates = GetAvailableDates(request.StartDate, request.EndDate, request.PreferredDays);

            var model = new CpModel();
            var x = new Dictionary<(DateTime date, int slot), BoolVar>();

            foreach (var date in availableDates)
            {
                for (int slot = 1; slot <= request.SlotsPerDay; slot++)
                {
                    if (!existingSlots.Contains((date.Date, slot)))
                    {
                        x[(date, slot)] = model.NewBoolVar($"x_{date:yyyyMMdd}_{slot}");
                    }
                }
            }

            model.Add(LinearExpr.Sum(x.Values) == request.TotalSessions);

            foreach (var date in availableDates)
            {
                var dailySlots = x.Where(k => k.Key.date == date).Select(k => k.Value).ToList();
                model.Add(LinearExpr.Sum(dailySlots) <= 1);
            }

            var objectiveTerms = x.Select((kvp, index) =>
                LinearExpr.Term(kvp.Value, index)).ToList();
            model.Minimize(LinearExpr.Sum(objectiveTerms));

            var solver = new CpSolver();
            var status = solver.Solve(model);

            if (status != CpSolverStatus.Feasible && status != CpSolverStatus.Optimal)
                throw new Exception("Không tìm được lịch phù hợp.");

            var schedule = x
                .Where(kvp => solver.Value(kvp.Value) > 0.5)
                .Select(kvp => new ScheduleItem
                {
                    ClassId = request.ClassId,
                    TeacherId = request.LecturerId,
                    ActualDate = kvp.Key.date,
                    Slot = kvp.Key.slot
                })
                .OrderBy(s => s.ActualDate)
                .ThenBy(s => s.Slot)
                .ToList();

            return schedule;
        }

        private static List<DateTime> GetAvailableDates(DateTime start, DateTime end, List<DayOfWeek> preferredDays)
        {
            var dates = new List<DateTime>();
            for (var date = start.Date; date <= end.Date; date = date.AddDays(1))
                if (preferredDays.Contains(date.DayOfWeek))
                    dates.Add(date);
            return dates;
        }

        public List<ScheduleItem> SolveScheduleForClass(ClassScheduleRequest request)
        {
            throw new NotImplementedException();
        }
    }
}
