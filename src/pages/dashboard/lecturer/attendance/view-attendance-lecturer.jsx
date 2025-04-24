//ViewAttendanceLecturerPage
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Calendar, Users, Clock } from "lucide-react";
import { useStore } from "@/services/StoreContext";
import { toast } from "sonner";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { GetLecturerClassList } from "@/services/classService";
import { AttendanceClassList } from "@/components/attendance/class-list";
import { AttendanceSessionList } from "@/components/attendance/session-list";
import { getSessionsByClassId } from "@/services/sessionService";
import AttendanceReportLecturer from "@/components/attendance/report-list";

export function ViewAttendanceLecturerPage() {
  const { classId } = useParams();
  const { pathname } = useLocation();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("classes");
  const [selectedClass, setSelectedClass] = useState(null);
  const [sessions, setSessions] = useState([]);
  const { state } = useStore();
  const { user } = state;
  const navigate = useNavigate();

  const lecturerId = user.uid;

  //fetch data
  useEffect(() => {
    async function fetchClasses() {
      try {
        const responseClasss = await GetLecturerClassList(lecturerId);

        // Check for today's sessions for each class
        const classesWithTodayInfo = await Promise.all(
          responseClasss.data.map(async (classItem) => {
            const responseSessions = await getSessionsByClassId(classItem.classId);

            // Lấy danh sách session hôm nay
            const todaySessions = responseSessions.data.filter((session) => {
              const sessionDate = new Date(session.sessionDate);
              const today = new Date();
              return sessionDate.toDateString() === today.toDateString();
            }).length;

            return {
              ...classItem,
              sessions: responseSessions.data,
              todaySessions,
            };
          })
        );

        setSessions((prevSessions) => {
          const newSessions = classesWithTodayInfo.flatMap((c) => c.sessions);
          return [...prevSessions, ...newSessions];
        });

        setClasses(classesWithTodayInfo);
        setLoading(false);
      } catch (error) {
        toast.error("Failed to fetch classes:", error);
        setLoading(false);
      }
    }

    fetchClasses();
  }, [lecturerId]);

  //get from url
  useEffect(() => {
    if (classId) {
      setSelectedClass(classId);
      if (pathname.startsWith("/attendance/report/")) {
        setActiveTab("report");
      } else if (pathname.startsWith("/attendance/")) {
        setActiveTab("sessions");
      }
    }
  }, [classId, pathname]);

  const handleClassSelect = (classId) => {
    console.log(sessions);

    setSelectedClass(classId);
    setActiveTab("sessions");
    navigate(`/lecturer/attendance/${classId}`);
  };
  const handleClassReportSelect = (classId) => {
    setSelectedClass(classId);
    setActiveTab("report");
    navigate(`/lecturer/attendance/report/${classId}`);
  };

  const handleTakeAttendance = (classId, sessionId) => {
    navigate(`/lecturer/attendance/${classId}/${sessionId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading classes...</span>
      </div>
    );
  }

  return (
    <div className="m-5">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
        {/* total class card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classes.length}</div>
          </CardContent>
        </Card>
        {/* active session */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classes.reduce((total, cls) => total + cls.sessions.length, 0)}</div>
          </CardContent>
        </Card>
        {/* today session */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Sessions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classes.reduce((total, cls) => total + cls.todaySessions, 0)}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="classes" onClick={() => navigate("/lecturer/attendance")}>
            My Classes
          </TabsTrigger>
          <TabsTrigger value="sessions" disabled={!classId}>
            Sessions
          </TabsTrigger>
          <TabsTrigger value="report" disabled={!classId}>
            Report
          </TabsTrigger>
        </TabsList>
        <TabsContent value="classes">
          <AttendanceClassList classes={classes} onSelectClass={handleClassSelect} onSelectReport={handleClassReportSelect} />
        </TabsContent>
        <TabsContent value="sessions">{selectedClass && <AttendanceSessionList classId={selectedClass} onTakeAttendance={handleTakeAttendance} />}</TabsContent>
        <TabsContent value="report">{selectedClass && <AttendanceReportLecturer classId={selectedClass} />}</TabsContent>
      </Tabs>
    </div>
  );
}
