import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getSessionsByClassId } from "@/services/sessionService";
import { getStudentList } from "@/services/accountService";

export default function AttendanceReportLecturer({ classId }) {
  const [sessions, setSessions] = useState();
  const [loading, setLoading] = useState(false);

  //fetchData
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [sessionRes, studentRes] = await Promise.all([getSessionsByClassId(classId), getStudentList()]);

        const sessions = sessionRes.data ?? [];
        const students = studentRes.data ?? [];

        // Tạo map { studentId: fullName } để tra cứu O(1)
        const nameMap = new Map(students.map((stu) => [stu.accountId, stu.fullName]));

        // Gắn fullName vào từng attendance
        const mergedSessions = sessions.map((session) => ({
          ...session,
          attendances: session.attendances.map((att) => ({
            ...att,
            fullName: nameMap.get(att.studentId) || "Unknown",
          })),
        }));

        setSessions(mergedSessions);
        console.log(mergedSessions[0]);
        setLoading(false);
      } catch (err) {
        setLoading(false);
        console.error("Fetch error:", err);
      }
    }

    fetchData();
  }, [classId]);

  // Process data to get attendance statistics
  const processAttendanceData = () => {
    if (!sessions) return;

    const studentAttendance = {};

    // Initialize student records from all sessions
    const uniqueStudents = new Map();

    sessions.forEach((session) => {
      session.attendances.forEach((attendance) => {
        uniqueStudents.set(attendance.studentId, attendance.fullName);
      });
    });

    uniqueStudents.forEach((fullName, studentId) => {
      studentAttendance[studentId] = {
        present: 0,
        absent: 0,
        total: 0,
        percentage: 0,
        sessions: {},
        fullName,
      };
    });

    // Calculate attendance for each student
    sessions.forEach((session) => {
      session.attendances.forEach((attendance) => {
        const studentId = attendance.studentId;
        if (!studentAttendance[studentId]) return;

        studentAttendance[studentId].total++;

        if (attendance.status === 1) {
          studentAttendance[studentId].present++;
        } else {
          studentAttendance[studentId].absent++;
        }

        studentAttendance[studentId].sessions[session.sessionId] = attendance.status;
      });
    });

    // Calculate percentages
    Object.keys(studentAttendance).forEach((studentId) => {
      const record = studentAttendance[studentId];
      record.percentage = record.total > 0 ? (record.present / record.total) * 100 : 0;
    });

    return studentAttendance;
  };

  const attendanceData = processAttendanceData();

  // Calculate overall statistics
  const calculateOverallStats = () => {
    let totalPresent = 0;
    let totalAbsent = 0;
    let totalSessions = 0;

    if (!attendanceData) return;

    Object.values(attendanceData).forEach((record) => {
      totalPresent += record.present;
      totalAbsent += record.absent;
      totalSessions += record.total;
    });

    const overallPercentage = totalSessions > 0 ? (totalPresent / totalSessions) * 100 : 0;

    return {
      totalPresent,
      totalAbsent,
      totalSessions,
      overallPercentage,
    };
  };

  const overallStats = calculateOverallStats();

  // Helper function to determine progress bar color based on percentage
  const getProgressColor = (percentage) => {
    if (percentage === 100) return "bg-green-500";
    if (percentage >= 75) return "bg-yellow-500";
    return "bg-red-500";
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex justify-center items-center h-40">
            <p>Loading attendance data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Attendance Report</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{sessions && sessions.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Overall Attendance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overallStats && overallStats.overallPercentage.toFixed(1)}%</div>
                <Progress value={overallStats && overallStats.overallPercentage} className={`h-2 mt-2 `} />
              </CardContent>
            </Card>
          </div>

          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky left-0 bg-background z-10 min-w-[200px] w-[300px]">Student</TableHead>
                  <TableHead colSpan={sessions && sessions.length} className="text-center border-l">
                    Sessions
                  </TableHead>
                </TableRow>
                <TableRow className="border-t-0">
                  <TableHead className="sticky left-0 bg-background z-10" />
                  {sessions &&
                    sessions
                      //.filter((s) => Array.isArray(s.attendances) && s.attendances.length > 0)
                      .map((session) => (
                        <TableHead key={session.sessionId} className="text-center p-1 text-xs font-normal">
                          {session.sessionNumber}
                        </TableHead>
                      ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendanceData &&
                  Object.keys(attendanceData).map((studentId) => {
                    const record = attendanceData[studentId];
                    return (
                      <TableRow key={studentId}>
                        <TableCell className="sticky left-0 bg-background z-10 p-2">
                          <div className="font-medium">{record.fullName}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <Progress value={record.percentage} className={`h-2 w-full  `} primaryColor={getProgressColor(record.percentage)} />
                            <span className="text-xs whitespace-nowrap">{record.percentage.toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                            <span>Present: {record.present}</span>
                            <span>Absent: {record.absent}</span>
                          </div>
                        </TableCell>

                        {sessions
                          //.filter((s) => Array.isArray(s.attendances) && s.attendances.length > 0)
                          .map((session) => {
                            // Find the attendance record for this student in this session
                            const attendanceRecord = session.attendances.find((a) => a.studentId === studentId);
                            const status = attendanceRecord?.status;

                            return (
                              <TableCell key={session.sessionId} className="text-center p-1">
                                {status === 1 ? (
                                  <div className="h-3 w-3 bg-green-500 rounded-full mx-auto" title="Present" />
                                ) : status === 0 ? (
                                  <div className="h-3 w-3 bg-red-500 rounded-full mx-auto" title="Absent" />
                                ) : (
                                  <div className="h-3 w-3 bg-secondary rounded-full mx-auto" title="Not Yet" />
                                )}
                              </TableCell>
                            );
                          })}
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
