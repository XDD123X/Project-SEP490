import { useState } from "react";
import { ArrowLeft, Calendar, Clock, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, useParams } from "react-router-dom";

// Mock data - replace with actual API calls
const classList = [
  {
    classId: "d1867509-bd00-4f47-a66b-2f6ca6e10e2c",
    classCode: "PRN231",
    className: "Building Cross-Platform Back-End Application With .NET",
    lecturerId: "a0cc6f1d-3a81-4f2b-bf86-6badc78cce66",
    courseId: "3a483099-5e2e-4175-9f25-2cec72638aac",
    totalSession: 64,
    startDate: "2025-03-25T08:34:08.197",
    scheduled: true,
    status: 2,
    course: {
      courseId: "28cbf78b-3460-4eb0-bc97-583d96f2fc71",
      courseName: "SAT",
      description: "Khóa học SAT 2025",
      createdBy: "4b046984-7ac4-4910-929c-940acf9234de",
      createdAt: "2025-03-25T12:28:46.887",
      updatedAt: null,
      status: 1,
      createdByNavigation: null,
    },
    lecturer: {
      accountId: "90251116-519c-4deb-96bd-bc7bc7273208",
      email: "lecturer2@gmail.com",
      fullName: "Nguyễn Thị Lan",
      roleId: "db210ec5-643f-4b27-8873-44d0d7387dc8",
      fulltime: true,
      phoneNumber: "0123456789",
      dob: "2000-01-01",
      gender: false,
      imgUrl: "https://i.imgur.com/0dTvSSQ.png",
      meetUrl: null,
      status: 1,
      createdAt: "2025-03-25T12:28:46.793",
      updatedAt: null,
      parents: [],
      role: null,
    },
  },
];

const sessionList = [
  {
    sessionId: "2cca9794-cad3-4e46-908b-b26576e852a2",
    sessionNumber: 1,
    classId: "d1867509-bd00-4f47-a66b-2f6ca6e10e2c",
    lecturerId: "a0cc6f1d-3a81-4f2b-bf86-6badc78cce66",
    sessionDate: "2025-03-25T00:00:00",
    slot: 3,
    description: null,
    sessionRecord: null,
    type: 1,
    status: 2,
    createdAt: "2025-03-25T16:58:31.173",
    updatedAt: "2025-03-25T17:03:23.2",
    class: null,
    lecturer: null,
    attendances: [
      {
        studentId: "47fdc937-32c9-46ed-bf97-a1bb3919a3ca",
        status: 1,
        note: "",
      },
      {
        studentId: "ad7b8b28-43d9-4d74-ac6d-6c859bbb52ad",
        status: 1,
        note: "",
      },
    ],
  },
  {
    sessionId: "26b2dd7d-baa4-4259-90c0-2d5833f10aa9",
    sessionNumber: 2,
    classId: "d1867509-bd00-4f47-a66b-2f6ca6e10e2c",
    lecturerId: "a0cc6f1d-3a81-4f2b-bf86-6badc78cce66",
    sessionDate: "2025-03-26T00:00:00",
    slot: 3,
    description: null,
    sessionRecord: null,
    type: 1,
    status: 1,
    createdAt: "2025-03-25T16:58:31.173",
    updatedAt: null,
    class: null,
    lecturer: null,
    attendances: [],
  },
];

// Assume current student ID
const currentStudentId = "47fdc937-32c9-46ed-bf97-a1bb3919a3ca";

// Map slot numbers to time ranges
const slotToTime = {
  1: "09:00 - 10:30",
  2: "11:00 - 12:30",
  3: "14:00 - 15:30",
  4: "16:00 - 17:30",
};

export default function ViewAttendanceClassStudentPage() {
  const { id } = useParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("sessionNumber");
  const [filterStatus, setFilterStatus] = useState("all");

  // Get class details
  const classDetails = classList.find((c) => c.classId === id) || classList[0];

  // Get sessions for this class
  const classSessions = sessionList.filter((session) => session.classId === id);

  // Filter sessions based on search and filter criteria
  const filteredSessions = classSessions.filter((session) => {
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
    const completedSessions = classSessions.filter((session) => session.status === 2);
    const totalCompletedSessions = completedSessions.length;

    let attendedSessions = 0;
    completedSessions.forEach((session) => {
      const studentAttendance = session.attendances.find((attendance) => attendance.studentId === currentStudentId);
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
      upcomingSessions: classSessions.filter((session) => session.status === 1).length,
    };
  };

  const stats = calculateAttendanceStats();

  // Get attendance status for a session
  const getAttendanceStatus = (session) => {
    if (session.status === 1) return "upcoming";

    const attendance = session.attendances.find((a) => a.studentId === currentStudentId);

    if (!attendance) return "unknown";
    return attendance.status === 1 ? "present" : "absent";
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/student/attendance">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">{classDetails.classCode} Attendance</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>{classDetails.className}</CardTitle>
            <CardDescription>Lecturer: {classDetails.lecturer.fullName}</CardDescription>
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
                <p className="text-xs text-muted-foreground">sessions</p>
              </div>
              <div className="bg-muted rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground">Absent</p>
                <p className="text-2xl font-bold">{stats.absentSessions}</p>
                <p className="text-xs text-muted-foreground">sessions</p>
              </div>
              <div className="bg-muted rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{stats.totalCompletedSessions}</p>
                <p className="text-xs text-muted-foreground">sessions</p>
              </div>
              <div className="bg-muted rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground">Upcoming</p>
                <p className="text-2xl font-bold">{stats.upcomingSessions}</p>
                <p className="text-xs text-muted-foreground">sessions</p>
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
                <span className="font-medium">{classDetails.course.courseName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Sessions:</span>
                <span className="font-medium">{classDetails.totalSession}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Start Date:</span>
                <span className="font-medium">{new Date(classDetails.startDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status:</span>
                <Badge variant={classDetails.status === 2 ? "default" : "secondary"}>{classDetails.status === 2 ? "Active" : "Inactive"}</Badge>
              </div>
            </div>

            <Button className="w-full" asChild>
              <Link to={`/student/attendance/complain?classId=${classDetails.classId}`}>Submit Attendance Complaint</Link>
            </Button>
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
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
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
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {new Date(session.sessionDate).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              {slotToTime[session.slot]}
                            </div>
                          </TableCell>
                          <TableCell>
                            {attendanceStatus === "present" && (
                              <Badge variant="success" className="bg-green-100 text-green-800 hover:bg-green-100">
                                Present
                              </Badge>
                            )}
                            {attendanceStatus === "absent" && <Badge variant="destructive">Absent</Badge>}
                            {attendanceStatus === "upcoming" && <Badge variant="outline">Upcoming</Badge>}
                            {attendanceStatus === "unknown" && <Badge variant="secondary">Unknown</Badge>}
                          </TableCell>
                          <TableCell className="text-right">
                            {attendanceStatus === "absent" && (
                              <Button size="sm" variant="outline" asChild>
                                <Link to={`/student/attendance/complain?sessionId=${session.sessionId}`}>Submit Complaint</Link>
                              </Button>
                            )}
                            {attendanceStatus === "upcoming" && (
                              <Button size="sm" variant="outline" disabled>
                                Upcoming
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
          <TabsContent value="completed" className="mt-6">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Session</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
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
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                {new Date(session.sessionDate).toLocaleDateString()}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                {slotToTime[session.slot]}
                              </div>
                            </TableCell>
                            <TableCell>
                              {attendanceStatus === "present" && (
                                <Badge variant="success" className="bg-green-100 text-green-800 hover:bg-green-100">
                                  Present
                                </Badge>
                              )}
                              {attendanceStatus === "absent" && <Badge variant="destructive">Absent</Badge>}
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
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
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
                              {new Date(session.sessionDate).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              {slotToTime[session.slot]}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">Upcoming</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="outline" disabled>
                              Upcoming
                            </Button>
                          </TableCell>
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
