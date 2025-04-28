using Google.OrTools.Sat;
using OTMS.BLL.DTOs;
using System.Globalization;

namespace OTMS.BLL.Services
{
    public class ScheduleSolverService : IScheduleSolverService
    {
        public List<ScheduleItem> SolveSchedule(ScheduleParameters parameters, List<SessionInfo> existingSessions)
        {
            var existingSlots = existingSessions
                .Select(s => (s.SessionDate.Date, s.Slot))
                .ToHashSet();

            var availableDates = GetAvailableDates(parameters.StartDate, parameters.EndDate, parameters.ValidDays);

            var availableSlots = parameters.AvailableSlots;

            var model = new CpModel();
            var x = new Dictionary<(DateTime date, int slot), BoolVar>();

            foreach (var date in availableDates)
            {
                foreach (int slot in availableSlots)
                {
                    if (slot <= parameters.SlotsPerDay && !existingSlots.Contains((date.Date, slot)))
                    {
                        x[(date, slot)] = model.NewBoolVar($"x_{date:yyyyMMdd}_{slot}");
                    }
                }
            }

            if (x.Count == 0)
                throw new Exception("Không có thời gian phù hợp để lập lịch. Vui lòng điều chỉnh các thông số.");

            //constraint tổng session học 
            model.Add(LinearExpr.Sum(x.Values) == parameters.TotalSessions);

            //constraint dailySlot học 1 buổi
            foreach (var date in availableDates)
            {
                var dailySlots = x.Where(k => k.Key.date == date).Select(k => k.Value).ToList();
                if (dailySlots.Any())
                {
                    model.Add(LinearExpr.Sum(dailySlots) <= 1);
                }
            }

            var calendar = CultureInfo.CurrentCulture.Calendar;
            var datesByWeek = availableDates.GroupBy(d => 
            {
                var week = calendar.GetWeekOfYear(d, CalendarWeekRule.FirstDay, DayOfWeek.Monday);
                return $"{d.Year}-{week}"; // Format năm-số tuần
            });

            //constraint max session per week
            foreach (var weekGroup in datesByWeek)
            {
                var weekSlots = new List<BoolVar>();
                foreach (var date in weekGroup)
                {
                    weekSlots.AddRange(x.Where(k => k.Key.date == date).Select(k => k.Value));
                }

                if (weekSlots.Any())
                {
                    model.Add(LinearExpr.Sum(weekSlots) <= parameters.MaxSessionsPerWeek);
                }
            }

            var objectiveTerms = x.Select((kvp, index) =>
                LinearExpr.Term(kvp.Value, index)).ToList();
            model.Minimize(LinearExpr.Sum(objectiveTerms));

            var solver = new CpSolver();
            var status = solver.Solve(model);

            if (status != CpSolverStatus.Feasible && status != CpSolverStatus.Optimal)
                throw new Exception("Không tìm được lịch phù hợp với các ràng buộc đã cho.");

            var schedule = x
                .Where(kvp => solver.Value(kvp.Value) > 0.5)
                .Select(kvp => new ScheduleItem
                {
                    ClassId = parameters.ClassId,
                    TeacherId = parameters.LecturerId,
                    ActualDate = kvp.Key.date,
                    Slot = kvp.Key.slot
                })
                .OrderBy(s => s.ActualDate)
                .ThenBy(s => s.Slot)
                .ToList();

            return schedule;
        }

        private static List<DateTime> GetAvailableDates(DateTime start, DateTime end, List<DayOfWeek> validDays)
        {
            var dates = new List<DateTime>();
            for (var date = start.Date; date <= end.Date; date = date.AddDays(1))
                if (validDays != null && validDays.Contains(date.DayOfWeek))
                    dates.Add(date);
            return dates;
        }
    }
}
