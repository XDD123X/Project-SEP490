import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStore } from "@/services/StoreContext";
import { GetClassListByStudentId } from "@/services/classService";
import { getSessionsByClassId } from "@/services/sessionService";

export default function ViewAttendanceStudentPage() {
  const { state } = useStore();
  const { user } = state;
  const studentId = user.uid;
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("classCode");
  const [classes, setClasses] = useState([]);
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const classResponse = await GetClassListByStudentId(studentId);
        if (classResponse.status === 200) {
          const classList = classResponse.data;
          const classesWithSessions = await Promise.all(
            classList.map(async (classItem) => {
              const sessionResponse = await getSessionsByClassId(classItem.classId);
              if (sessionResponse.status === 200) {
                return {
                  ...classItem,
                  sessions: sessionResponse.data,
                };
              }
              return classItem;
            })
          );
          setClasses(classesWithSessions);
          const allSessions = classesWithSessions.flatMap((classItem) => classItem.sessions || []);
          setSessions(allSessions);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [studentId]);

  // Filter classes based on search term
  const filteredClasses = classes.filter(
    (classItem) => classItem.classCode.toLowerCase().includes(searchTerm.toLowerCase()) || classItem.className.toLowerCase().includes(searchTerm.toLowerCase()) || classItem.lecturer.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort classes based on sort criteria
  const sortedClasses = [...filteredClasses].sort((a, b) => {
    if (sortBy === "classCode") {
      return a.classCode.localeCompare(b.classCode);
    } else if (sortBy === "className") {
      return a.className.localeCompare(b.className);
    } else if (sortBy === "lecturerName") {
      return a.lecturer.fullName.localeCompare(b.lecturer.fullName);
    }
    return 0;
  });

  // Calculate attendance statistics
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
    };
  };

  const stats = calculateAttendanceStats();

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Attendance Overview</h1>
          <p className="text-muted-foreground">View and manage your attendance across all classes</p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search classes..." className="w-full md:w-[250px] pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>

          <Select
            className="border rounded-md px-3 py-2 bg-background"
            value={sortBy}
            onValueChange={(value) => setSortBy(value)} // onChange -> onValueChange
          >
            <SelectTrigger>
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="classCode">Sort by Code</SelectItem>
              <SelectItem value="className">Sort by Name</SelectItem>
              <SelectItem value="lecturerName">Sort by Lecturer</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Attendance Statistics</CardTitle>
            <CardDescription>Your current attendance performance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Attendance Rate</span>
                <span className="text-sm font-medium">{stats.attendancePercentage}%</span>
              </div>
              <Progress value={stats.attendancePercentage} className="h-2" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.totalCompletedSessions}</p>
                <p className="text-xs text-muted-foreground">completed sessions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your attendance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full" asChild>
              <Link to="/student/attendance/complain">Submit Attendance Complaint</Link>
            </Button>
            <Button variant="outline" className="w-full">
              Download Attendance Report
            </Button>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full md:w-[400px] grid-cols-2">
          <TabsTrigger value="active">Active Classes</TabsTrigger>
          <TabsTrigger value="all">All Classes</TabsTrigger>
        </TabsList>
        <TabsContent value="active" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedClasses.map((classItem) => (
              <Card key={classItem.classId}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{classItem.classCode}</CardTitle>
                      <CardDescription className="line-clamp-2">{classItem.className}</CardDescription>
                    </div>
                    <div className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md">{classItem.status === 2 ? "Studying" : classItem.status === 1 ? "Upcoming" : "Cancelled"}</div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Lecturer:</span>
                      <span className="font-medium">{classItem.lecturer.fullName}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Sessions:</span>
                      <span className="font-medium">{classItem.totalSession}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Start Date:</span>
                      <span className="font-medium">{new Date(classItem.startDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" asChild>
                    <Link to={`/student/attendance/class/${classItem.classId}`}>View Details</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedClasses.map((classItem) => (
              <Card key={classItem.classId}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{classItem.classCode}</CardTitle>
                      <CardDescription className="truncate">{classItem.className}</CardDescription>
                    </div>
                    <div className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md">{classItem.status === 2 ? "Active" : "Inactive"}</div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Lecturer:</span>
                      <span className="font-medium">{classItem.lecturer.fullName}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Sessions:</span>
                      <span className="font-medium">{classItem.totalSession}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Start Date:</span>
                      <span className="font-medium">{new Date(classItem.startDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" asChild>
                    <Link to={`/student/attendance/class/${classItem.classId}`}>View Details</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
