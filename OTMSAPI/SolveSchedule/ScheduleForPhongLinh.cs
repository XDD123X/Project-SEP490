using System;
using System.Collections.Generic;
using Google.OrTools.Sat;
using System.Globalization;

namespace OTMSAPI.SolveSchedule
{

    public class ScheduleSlotForPhongLinh
    {
        /// <summary>
        /// Tạo lịch dạy học tối ưu theo các ràng buộc.
        /// </summary>
        /// <param name="classes">Danh sách các lớp học.</param>
        /// <param name="classSessionCount">Số buổi học cho từng lớp.</param>
        /// <param name="teachers">Danh sách giáo viên.</param>
        /// <param name="teacherOfClass">Danh sách giáo viên phụ trách từng lớp.</param>
        /// <param name="totalWeeks">Tổng số tuần.</param>
        /// <param name="daysPerWeek">Số ngày mỗi tuần.</param>
        /// <param name="slotsPerDay">Số ca học mỗi ngày.</param>
        public static void SolveSchedule(string[] classes, Dictionary<string, int> classSessionCount, string[] teachers, 
            Dictionary<string, string> teacherOfClass, int totalWeeks, int daysPerWeek, int slotsPerDay)
        {
            CpModel model = new CpModel();
            var x = new Dictionary<(string c, int w, int d, int s, string g), BoolVar>();

            foreach (var c in classes)
                for (int w = 0; w < totalWeeks; w++)
                    for (int d = 0; d < daysPerWeek; d++)
                        for (int s = 1; s <= slotsPerDay; s++)
                            foreach (var g in teachers)
                                x[(c, w, d, s, g)] = model.NewBoolVar($"x_{c}_w{w}_d{d}_slot{s}_{g}");

            foreach (var c in classes)
            {
                var varsOfClass = new List<ILiteral>();
                for (int w = 0; w < totalWeeks; w++)
                    for (int d = 0; d < daysPerWeek; d++)
                        for (int s = 1; s <= slotsPerDay; s++)
                            foreach (var g in teachers) varsOfClass.Add(x[(c, w, d, s, g)]);
                model.Add(LinearExpr.Sum(varsOfClass) == classSessionCount[c]);
            }

            foreach (var c in classes)
                for (int w = 0; w < totalWeeks; w++)
                {
                    var varsWeek = new List<ILiteral>();
                    for (int d = 0; d < daysPerWeek; d++)
                        for (int s = 1; s <= slotsPerDay; s++)
                            foreach (var g in teachers) varsWeek.Add(x[(c, w, d, s, g)]);
                    model.Add(LinearExpr.Sum(varsWeek) <= 2);
                }

            foreach (var c in classes)
            {
                string forcedG = teacherOfClass[c];
                foreach (var g in teachers)
                    if (g != forcedG)
                        for (int w = 0; w < totalWeeks; w++)
                            for (int d = 0; d < daysPerWeek; d++)
                                for (int s = 1; s <= slotsPerDay; s++)
                                    model.Add(x[(c, w, d, s, g)] == 0);
            }

            for (int w = 0; w < totalWeeks; w++)
                for (int d = 0; d < daysPerWeek; d++)
                    for (int s = 1; s <= slotsPerDay; s++)
                        foreach (var g in teachers)
                        {
                            var varsList = new List<ILiteral>();
                            foreach (var c in classes) varsList.Add(x[(c, w, d, s, g)]);
                            model.Add(LinearExpr.Sum(varsList) <= 1);
                        }

            List<LinearExpr> objectiveTerms = new List<LinearExpr>();
            for (int w = 0; w < totalWeeks; w++)
                for (int d = 0; d < daysPerWeek; d++)
                {
                    int offset = w * 7 + d;
                    for (int s = 1; s <= slotsPerDay; s++)
                        foreach (var c in classes)
                            foreach (var g in teachers)
                                objectiveTerms.Add(LinearExpr.Term(x[(c, w, d, s, g)], offset));
                }

            model.Minimize(LinearExpr.Sum(objectiveTerms));
            CpSolver solver = new CpSolver();
            CpSolverStatus status = solver.Solve(model);

            if (status == CpSolverStatus.Optimal || status == CpSolverStatus.Feasible)
            {
                Console.WriteLine("=== Tim duoc loi giai hop le ===");
                var results = new List<(int w, int d, int s, string c, string g)>();
                foreach (var c in classes)
                    for (int w = 0; w < totalWeeks; w++)
                        for (int d = 0; d < daysPerWeek; d++)
                            for (int s = 1; s <= slotsPerDay; s++)
                                foreach (var g in teachers)
                                    if (solver.Value(x[(c, w, d, s, g)]) > 0.5)
                                        results.Add((w, d, s, c, g));

                results.Sort((a, b) => a.w != b.w ? a.w.CompareTo(b.w) : a.d != b.d ? a.d.CompareTo(b.d) : a.s.CompareTo(b.s));
                DateTime startDate = GetNextMonday(DateTime.Now);
                foreach (var item in results)
                {
                    DateTime actualDate = startDate.AddDays(item.w * 7 + item.d);
                    Console.WriteLine($"- {item.c} | GV={item.g} | Ngày={actualDate:dd/MM/yyyy} ({actualDate.DayOfWeek}), Slot={item.s}");
                }
            }
            else Console.WriteLine("Khong tim duoc loi giai kha thi (INFEASIBLE). ");
        }

        public static DateTime GetNextMonday(DateTime current)
        {
            while (current.DayOfWeek != DayOfWeek.Monday) current = current.AddDays(1);
            return current.AddDays(7);
        }

        //public static void Main()
        //{
        //    string[] classes = { "SAT1", "SAT2", "SAT3", "IELTS1", "IELTS2", "IELTS3" };
        //    var classSessionCount = new Dictionary<string, int>();
        //    foreach (var c in classes) classSessionCount[c] = 15;
        //    string[] teachers = { "Phuong", "Nhung", "Giang", "Trang" };
        //    var teacherOfClass = new Dictionary<string, string>
        //{
        //    { "SAT1", "Nhung" },
        //    { "SAT2", "Phuong" },
        //    { "SAT3", "Nhung" },
        //    { "IELTS1", "Giang" },
        //    { "IELTS2", "Trang" },
        //    { "IELTS3", "Giang" }
        //};
        //    SolveSchedule(classes, classSessionCount, teachers, teacherOfClass, 8, 7, 4);
        //}
    }

}
