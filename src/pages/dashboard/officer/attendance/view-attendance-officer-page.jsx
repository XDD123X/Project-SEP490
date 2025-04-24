import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Users, Clock } from "lucide-react";
import { toast } from "sonner";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { GetClassList } from "@/services/classService";
import { getSessionsByClassId } from "@/services/sessionService";
import AttendanceReportLecturer from "@/components/attendance/report-list";
import { OfficerAttendanceClassList } from "@/components/attendance/officer-class-list";

export function ViewAttendanceOfficerPage() {
  const { classId } = useParams();
  const { pathname } = useLocation();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("classes");
  const [selectedClass, setSelectedClass] = useState(null);
  const [sessions, setSessions] = useState([]);
  const navigate = useNavigate();

  //fetch data
  useEffect(() => {
    async function fetchClasses() {
      try {
        const responseClasss = await GetClassList();

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
  }, []);

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
    navigate(`/officer/attendance/${classId}`);
  };
  const handleClassReportSelect = (classId) => {
    setSelectedClass(classId);
    setActiveTab("report");
    navigate(`/officer/attendance/report/${classId}`);
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
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2 mb-6">
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
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="classes" onClick={() => navigate("/officer/attendance")}>
            Classes
          </TabsTrigger>
          <TabsTrigger value="report" disabled={!classId}>
            Report
          </TabsTrigger>
        </TabsList>
        <TabsContent value="classes">
          <OfficerAttendanceClassList classes={classes} onSelectClass={handleClassSelect} onSelectReport={handleClassReportSelect} />
        </TabsContent>
        <TabsContent value="report">{selectedClass && <AttendanceReportLecturer classId={selectedClass} />}</TabsContent>
      </Tabs>
    </div>
  );
}
