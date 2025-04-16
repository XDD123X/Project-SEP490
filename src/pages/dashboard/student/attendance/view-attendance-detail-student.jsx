import { useEffect, useState } from "react";
import { ArrowLeft, Calendar, Clock, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, useParams } from "react-router-dom";
import { GetClassById } from "@/services/classService";
import { getSessionsByClassId } from "@/services/sessionService";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { format } from "date-fns";
import { AttendanceBadge, SessionBadge } from "@/components/BadgeComponent";
import { useStore } from "@/services/StoreContext";

// Map slot numbers to time ranges
const slotToTime = {
  1: "09:00 - 10:30",
  2: "11:00 - 12:30",
  3: "14:00 - 15:30",
  4: "16:00 - 17:30",
};

export default function ViewAttendanceClassStudentPage() {
  const { classId } = useParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("sessionNumber");
  const [filterStatus, setFilterStatus] = useState("all");
  const [classData, setClassData] = useState([]);
  const [sessions, setSessions] = useState([]);
  const { state } = useStore();
  const { user } = state;
  const studentId = user.uid;

  //fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        //class
        const classResponse = await GetClassById(classId);
        const sessionResponse = await getSessionsByClassId(classId);

        if (classResponse.status === 200) {
          setClassData(classResponse.data);
          setSessions(sessionResponse.data);
        }
      } catch (error) {
        console.log(error);
        toast.error(error);
      }
    };
    fetchData();
  }, [classId]);

  // Filter sessions based on search and filter criteria
  const filteredSessions = sessions.filter((session) => {
    const matchesSearch = session.sessionNumber.toString().includes(searchTerm) || new Date(session.sessionDate).toLocaleDateString().includes(searchTerm);

    if (filterStatus === "all") return matchesSearch;
    if (filterStatus === "attended") {
      const attendance = session.attendances.find((a) => a.studentId === currentStudentId);
      return matchesSearch && attendance?.status === 1;
    }
    if (filterStatus === "absent") {
      const attendance = session.attendances.find((a) => a.studentId === currentStudentId);
      return matchesSearch && attendance?.status === 0;
    }
    if (filterStatus === "upcoming") {
      return matchesSearch && session.status === 1;
    }

    return matchesSearch;
  });

  // Sort sessions
  const sortedSessions = [...filteredSessions].sort((a, b) => {
    if (sortBy === "sessionNumber") {
      return a.sessionNumber - b.sessionNumber;
    } else if (sortBy === "date") {
      return new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime();
    }
    return 0;
  });

  // Calculate attendance statistics for this class
  const calculateAttendanceStats = () => {
    const completedSessions = sessions.filter((session) => session.status === 2);
    const totalCompletedSessions = completedSessions.length;

    let attendedSessions = 0;
    completedSessions.forEach((session) => {
      const studentAttendance = session.attendances.find((attendance) => attendance.studentId === studentId);
      if (studentAttendance && studentAttendance.status === 1) {
        attendedSessions++;
      }
    });

    const attendancePercentage = totalCompletedSessions > 0 ? Math.round((attendedSessions / totalCompletedSessions) * 100) : 100;

    const absentSessions = totalCompletedSessions - attendedSessions;

    return {
      attendancePercentage,
      attendedSessions,
      totalCompletedSessions,
      absentSessions,
      upcomingSessions: sessions.filter((session) => session.status === 1).length,
    };
  };

  const stats = calculateAttendanceStats();

  // Get attendance status for a session
  const getAttendanceStatus = (session) => {
    if (session.status === 1) return 2;
    console.log(session);

    const attendance = session.attendances.find((a) => a.studentId === studentId);
    console.log(attendance);

    if (!attendance) return "unknown";
    return attendance.status === 1 ? 1 : 0;
  };

  if (!classData && !sessions) {
    return (
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/student/attendance">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">{classData.classCode} Attendance</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>{classData.className}</CardTitle>
            <CardDescription>Lecturer: {classData.lecturer?.fullName || "N/A"}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Attendance Rate</span>
                <span className="text-sm font-medium">{stats.attendancePercentage}%</span>
              </div>
              <Progress value={stats.attendancePercentage} className="h-2" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-muted rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground">Attended</p>
                <p className="text-2xl font-bold">{stats.attendedSessions}</p>
              </div>
              <div className="bg-muted rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground">Absent</p>
                <p className="text-2xl font-bold">{stats.absentSessions}</p>
              </div>
              <div className="bg-muted rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{stats.totalCompletedSessions}</p>
              </div>
              <div className="bg-muted rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground">Upcoming</p>
                <p className="text-2xl font-bold">{stats.upcomingSessions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Class Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Course:</span>
                <span className="font-medium">{classData.course?.courseName || "N/A"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Sessions:</span>
                <span className="font-medium">{classData.totalSession}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Start Date:</span>
                <span className="font-medium">{new Date(classData.startDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status:</span>
                <Badge variant={classData.status === 2 ? "default" : "secondary"}>{classData.status === 2 ? "Active" : "Inactive"}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-2xl font-bold">Session Attendance</h2>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search sessions..." className="w-full md:w-[250px] pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <select className="border rounded-md px-3 py-2 bg-background" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="sessionNumber">Sort by Number</option>
              <option value="date">Sort by Date</option>
            </select>
            <select className="border rounded-md px-3 py-2 bg-background" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">All Sessions</option>
              <option value="attended">Attended</option>
              <option value="absent">Absent</option>
              <option value="upcoming">Upcoming</option>
            </select>
          </div>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full md:w-[400px] grid-cols-3">
            <TabsTrigger value="all">All Sessions</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-6">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Session</TableHead>
                      <TableHead>Slot</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      {/* <TableHead className="text-right">Actions</TableHead> */}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedSessions.map((session) => {
                      const attendanceStatus = getAttendanceStatus(session);
                      return (
                        <TableRow key={session.sessionId}>
                          <TableCell className="font-medium">Session {session.sessionNumber}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              Slot {session.slot} ({slotToTime[session.slot]})
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {format(session.sessionDate, "EEEE, dd/MM/yyyy")}
                            </div>
                          </TableCell>

                          <TableCell>
                            <AttendanceBadge status={getAttendanceStatus(session)} />
                          </TableCell>
                          {/* <TableCell className="text-right">
                            {attendanceStatus === 0 && (
                              <Button size="sm" variant="outline" asChild>
                                <Link to={`/student/attendance/complain?sessionId=${session.sessionId}`}>Submit Complaint</Link>
                              </Button>
                            )}
                            {attendanceStatus === "upcoming" && (
                              <Button size="sm" variant="outline" disabled>
                                Upcoming
                              </Button>
                            )}
                          </TableCell> */}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="completed" className="mt-6">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Session</TableHead>
                      <TableHead>Slot</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedSessions
                      .filter((session) => session.status === 2)
                      .map((session) => {
                        const attendanceStatus = getAttendanceStatus(session);
                        return (
                          <TableRow key={session.sessionId}>
                            <TableCell className="font-medium">Session {session.sessionNumber}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                Slot {session.slot} ({slotToTime[session.slot]})
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                {format(session.sessionDate, "EEEE, dd/MM/yyyy")}
                              </div>
                            </TableCell>

                            <TableCell>
                              <AttendanceBadge status={getAttendanceStatus(session)} />
                            </TableCell>
                            <TableCell className="text-right">
                              {attendanceStatus === "absent" && (
                                <Button size="sm" variant="outline" asChild>
                                  <Link to={`/student/attendance/complain?sessionId=${session.sessionId}`}>Submit Complaint</Link>
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="upcoming" className="mt-6">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Session</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      {/* <TableHead className="text-right">Actions</TableHead> */}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedSessions
                      .filter((session) => session.status === 1)
                      .map((session) => (
                        <TableRow key={session.sessionId}>
                          <TableCell className="font-medium">Session {session.sessionNumber}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {format(session.sessionDate, 'dd/MM/yyyy')}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              Slot {session.slot} ({slotToTime[session.slot]})
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">Upcoming</Badge>
                          </TableCell>
                          {/* <TableCell className="text-right">
                            <Button size="sm" variant="outline" disabled>
                              Upcoming
                            </Button>
                          </TableCell> */}
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
