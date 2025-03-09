//using System;
//using System.Collections.Generic;
//using Google.OrTools.Sat;
//using System.Globalization;
//using OTMS.BLL.DTOs;

//namespace OTMS.API.SolveSchedule
//{
//    // Lớp (hoặc record) chứa thông tin kết quả


//    public class ScheduleSlotForPhongLinh
//    {
//        /// <summary>
//        /// Tạo lịch dạy học tối ưu theo các ràng buộc.
//        /// </summary>
//        /// <param name="classes">Danh sách các lớp học.</param>
//        /// <param name="classSessionCount">Số buổi học cho từng lớp.</param>
//        /// <param name="teachers">Danh sách giáo viên.</param>
//        /// <param name="teacherOfClass">Danh sách giáo viên phụ trách từng lớp.</param>
//        /// <param name="totalWeeks">Tổng số tuần.</param>
//        /// <param name="daysPerWeek">Số ngày mỗi tuần.</param>
//        /// <param name="slotsPerDay">Số ca học mỗi ngày.</param>
//        /// <returns>Danh sách các slot lịch dạy tìm được (nếu khả thi) hoặc rỗng nếu không tìm được lời giải.</returns>
//        public static List<ScheduleItem> SolveSchedule(
//           Guid[] classIds,
//           Dictionary<Guid, int> classSessionCount,
//           Guid[] teacherIds,
//           Dictionary<Guid, Guid> teacherOfClass,
//           int totalWeeks,
//           int daysPerWeek,
//           int slotsPerDay)
//        {
//            // 1) Khởi tạo model
//            CpModel model = new CpModel();

//            // Dictionary để chứa biến nhị phân x[(classId, w, d, slot, teacherId)]
//            var x = new Dictionary<(Guid c, int w, int d, int s, Guid t), BoolVar>();

//            // Tạo biến
//            foreach (var c in classIds)
//            {
//                for (int w = 0; w < totalWeeks; w++)
//                {
//                    for (int d = 0; d < daysPerWeek; d++)
//                    {
//                        for (int s = 1; s <= slotsPerDay; s++)
//                        {
//                            foreach (var t in teacherIds)
//                            {
//                                // Tạo tên biến để debug
//                                string varName = $"x_{c}_{w}_{d}_{s}_{t}";
//                                x[(c, w, d, s, t)] = model.NewBoolVar(varName);
//                            }
//                        }
//                    }
//                }
//            }

//            // 1 lớp c phải học đúng số buổi 
//            foreach (var c in classIds)
//            {
//                var varsOfClass = new List<ILiteral>();
//                for (int w = 0; w < totalWeeks; w++)
//                {
//                    for (int d = 0; d < daysPerWeek; d++)
//                    {
//                        for (int s = 1; s <= slotsPerDay; s++)
//                        {
//                            foreach (var t in teacherIds)
//                            {
//                                varsOfClass.Add(x[(c, w, d, s, t)]);
//                            }
//                        }
//                    }
//                }
//                model.Add(LinearExpr.Sum(varsOfClass) == classSessionCount[c]);
//            }

//            // 1 lớp trong 1tuần không được học quá 2 buổi
//            foreach (var c in classIds)
//            {
//                for (int w = 0; w < totalWeeks; w++)
//                {
//                    var varsWeek = new List<ILiteral>();
//                    for (int d = 0; d < daysPerWeek; d++)
//                    {
//                        for (int s = 1; s <= slotsPerDay; s++)
//                        {
//                            foreach (var t in teacherIds)
//                            {
//                                varsWeek.Add(x[(c, w, d, s, t)]);
//                            }
//                        }
//                    }
//                    model.Add(LinearExpr.Sum(varsWeek) <= 2);
//                }
//            }

//            //  mỗi lớp c chỉ được học với giáo viên đã được chỉ định
//            foreach (var c in classIds)
//            {
//                // Lấy teacherId bắt buộc
//                Guid forcedTeacher = teacherOfClass[c];

//                foreach (var t in teacherIds)
//                {
//                    if (t != forcedTeacher)
//                    {
//                        for (int w = 0; w < totalWeeks; w++)
//                        {
//                            for (int d = 0; d < daysPerWeek; d++)
//                            {
//                                for (int s = 1; s <= slotsPerDay; s++)
//                                {
//                                    model.Add(x[(c, w, d, s, t)] == 0);
//                                }
//                            }
//                        }
//                    }
//                }
//            }

//            // Không để 2 lớp cùng 1 (week, day, slot)
//            for (int w = 0; w < totalWeeks; w++)
//            {
//                for (int d = 0; d < daysPerWeek; d++)
//                {
//                    for (int s = 1; s <= slotsPerDay; s++)
//                    {
//                        var varsList = new List<ILiteral>();
//                        foreach (var t in teacherIds)
//                        {
//                            foreach (var c in classIds)
//                            {
//                                varsList.Add(x[(c, w, d, s, t)]);
//                            }
//                        }
//                        model.Add(LinearExpr.Sum(varsList) <= 1);
//                    }
//                }
//            }

//            //Mỗi lớp, mỗi ngày 
//            foreach (var c in classIds)
//            {
//                for (int w = 0; w < totalWeeks; w++)
//                {
//                    for (int d = 0; d < daysPerWeek; d++)
//                    {
//                        var varsSameDay = new List<ILiteral>();
//                        for (int s = 1; s <= slotsPerDay; s++)
//                        {
//                            foreach (var t in teacherIds)
//                            {
//                                varsSameDay.Add(x[(c, w, d, s, t)]);
//                            }
//                        }
//                        model.Add(LinearExpr.Sum(varsSameDay) <= 1);
//                    }
//                }
//            }

//            //mỗi giáo viên t chỉ dạy tối đa 1 lớp tại 1 thời điểm (w,d,s)
//            //    => sum x[c, w, d, s, t] (cho tất cả c) <= 1
//            for (int w = 0; w < totalWeeks; w++)
//            {
//                for (int d = 0; d < daysPerWeek; d++)
//                {
//                    for (int s = 1; s <= slotsPerDay; s++)
//                    {
//                        foreach (var t in teacherIds)
//                        {
//                            var varsList = new List<ILiteral>();
//                            foreach (var c in classIds)
//                            {
//                                varsList.Add(x[(c, w, d, s, t)]);
//                            }
//                            model.Add(LinearExpr.Sum(varsList) <= 1);
//                        }
//                    }
//                }
//            }

//            // hàm mục tiêu minimize cho xếp lịch càng sớm
//            var objectiveTerms = new List<LinearExpr>();
//            for (int w = 0; w < totalWeeks; w++)
//            {
//                for (int d = 0; d < daysPerWeek; d++)
//                {
//                    for (int s = 1; s <= slotsPerDay; s++)
//                    {
//                        // offset xét thêm slot
//                        int offset = w * daysPerWeek * slotsPerDay
//                                   + d * slotsPerDay
//                                   + (s - 1);

//                        foreach (var c in classIds)
//                        {
//                            foreach (var t in teacherIds)
//                            {
//                                objectiveTerms.Add(LinearExpr.Term(x[(c, w, d, s, t)], offset));
//                            }
//                        }
//                    }
//                }
//            }
//            model.Minimize(LinearExpr.Sum(objectiveTerms));

//            // Giải model
//            CpSolver solver = new CpSolver();
//            CpSolverStatus status = solver.Solve(model);

//            // Danh sách kết quả
//            var results = new List<ScheduleItem>();

//            if (status == CpSolverStatus.Optimal || status == CpSolverStatus.Feasible)
//            {
//                // Lấy ngày bắt đầu
//                DateTime startDate = GetNextMonday(DateTime.Now);

//                // Thu thập kết quả
//                foreach (var c in classIds)
//                {
//                    for (int w = 0; w < totalWeeks; w++)
//                    {
//                        for (int d = 0; d < daysPerWeek; d++)
//                        {
//                            for (int s = 1; s <= slotsPerDay; s++)
//                            {
//                                foreach (var t in teacherIds)
//                                {
//                                    // Kiểm tra biến x[c,w,d,s,t] = 1?
//                                    if (solver.Value(x[(c, w, d, s, t)]) > 0.5)
//                                    {
//                                        DateTime actualDate = startDate.AddDays(w * 7 + d);

//                                        results.Add(new ScheduleItem
//                                        {
//                                            ClassId = c,
//                                            TeacherId = t,
//                                            Week = w,
//                                            Day = d,
//                                            Slot = s,
//                                            ActualDate = actualDate
//                                        });
//                                    }
//                                }
//                            }
//                        }
//                    }
//                }

//                // Sắp xếp kết quả
//                results.Sort((a, b) =>
//                {
//                    int cmpW = a.Week.CompareTo(b.Week);
//                    if (cmpW != 0) return cmpW;
//                    int cmpD = a.Day.CompareTo(b.Day);
//                    if (cmpD != 0) return cmpD;
//                    return a.Slot.CompareTo(b.Slot);
//                });
//            }
//            else
//            {
//                throw new Exception("Không tìm được lời giải khả thi.");
//            }

//            return results;
//        }


//        public static DateTime GetNextMonday(DateTime current)
//        {
//            while (current.DayOfWeek != DayOfWeek.Monday)
//                current = current.AddDays(1);
//            return current.AddDays(7);
//        }
//    }
//}
