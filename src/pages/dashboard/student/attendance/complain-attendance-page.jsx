import { useEffect, useState } from "react";
import { ArrowLeft, Check, Info } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Link, useParams } from "react-router-dom";

// Mock API functions
const GetClassList = async () => {
  // This would be a real API call in production
  return [
    {
      classId: "d1867509-bd00-4f47-a66b-2f6ca6e10e2c",
      classCode: "PRN231",
      className: "Building Cross-Platform Back-End Application With .NET",
      lecturerId: "a0cc6f1d-3a81-4f2b-bf86-6badc78cce66",
      courseId: "3a483099-5e2e-4175-9f25-2cec72638aac",
      totalSession: 64,
      startDate: "2025-03-25T08:34:08.197",
      endDate: null,
      classUrl: null,
      createdAt: "2025-03-25T15:35:41.12",
      updatedAt: null,
      status: 2,
      scheduled: true,
      classStudents: [],
      course: null,
      lecturer: null,
      sessions: [],
    },
    {
      classId: "18712e96-6ece-43a1-a131-724c90b4e9e1",
      classCode: "IELTS25-03/25",
      className: "Lớp IELTS25 Khai Giảng 03-25",
      lecturerId: "848ef6ab-33b2-4722-bf42-4a47c61e8677",
      courseId: "ddd99402-4f7e-4753-8c05-8f4818d7ff30",
      totalSession: 30,
      startDate: "2025-03-25T12:28:46.9",
      endDate: null,
      classUrl: null,
      createdAt: "2025-03-25T12:28:46.9",
      updatedAt: null,
      status: 1,
      scheduled: false,
      classStudents: [],
      course: null,
      lecturer: null,
      sessions: [],
    },
  ];
};

// Mock function to get sessions for a class
const GetSessionsByClassId = async (classId) => {
  // This would be a real API call in production
  const today = new Date();
  const sessions = [];

  // Generate past sessions
  for (let i = 1; i <= 15; i++) {
    const sessionDate = new Date();
    sessionDate.setDate(today.getDate() - i * 2);

    sessions.push({
      sessionId: `session-past-${i}-${classId}`,
      classId: classId,
      sessionNumber: i,
      date: sessionDate.toISOString(),
      startTime: "08:00:00",
      endTime: "10:00:00",
      status: "Completed",
      attendance: Math.random() > 0.2 ? "Present" : "Absent",
      room: `Room ${Math.floor(Math.random() * 10) + 100}`,
      topic: `Topic ${i}: ${Math.random() > 0.5 ? "Introduction to concepts" : "Advanced techniques"}`,
    });
  }

  return sessions;
};

// Helper to format date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

export default function AttendanceComplain() {
  const { classId } = useParams();
  const preselectedClassId = classId;

  const [classes, setClasses] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSession, setSelectedSession] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const classList = await GetClassList();
        setClasses(classList);

        if (preselectedClassId) {
          setSelectedClass(preselectedClassId);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching classes:", error);
        setLoading(false);
      }
    };

    fetchClasses();
  }, [preselectedClassId]);

  useEffect(() => {
    const fetchSessions = async () => {
      if (!selectedClass) {
        setSessions([]);
        return;
      }

      try {
        const sessionsList = await GetSessionsByClassId(selectedClass);
        // Only show sessions marked as absent
        const absentSessions = sessionsList.filter((s) => s.attendance === "Absent");
        setSessions(absentSessions);
      } catch (error) {
        console.error("Error fetching sessions:", error);
      }
    };

    fetchSessions();
  }, [selectedClass]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // In a real app, this would send the data to the server
    console.log({
      classId: selectedClass,
      sessionId: selectedSession,
      reason,
    });

    // Show success message
    setSubmitted(true);
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (submitted) {
    return (
      <div className="container mx-auto py-6 px-4 md:px-6 max-w-md">
        <Link to="/student/attendance" className="flex items-center text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Attendance
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Check className="mr-2 h-5 w-5 text-green-600" />
              Complaint Submitted
            </CardTitle>
            <CardDescription>Your attendance complaint has been submitted successfully</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Your complaint has been received and will be reviewed by the academic staff. You will be notified once a decision has been made.</p>

            <div className="bg-muted p-4 rounded-lg">
              <div className="mb-2">
                <span className="font-medium">Class:</span> {classes.find((c) => c.classId === selectedClass)?.classCode}
              </div>
              <div className="mb-2">
                <span className="font-medium">Session:</span> {sessions.find((s) => s.sessionId === selectedSession)?.sessionNumber}
                {" - "}
                {formatDate(sessions.find((s) => s.sessionId === selectedSession)?.date)}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link to="/student/attendance">Return to Attendance</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 md:px-6 max-w-md">
      <Link to="/student/attendance" className="flex items-center text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Attendance
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Report Attendance Issue</CardTitle>
          <CardDescription>Submit a complaint if you believe your attendance was incorrectly marked</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6">
            <Info className="h-4 w-4" />
            <AlertTitle>Important</AlertTitle>
            <AlertDescription>Only submit a complaint if you were present in class but marked as absent. False reports may result in disciplinary action.</AlertDescription>
          </Alert>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="class">Select Class</Label>
                <Select value={selectedClass} onValueChange={setSelectedClass} required>
                  <SelectTrigger id="class">
                    <SelectValue placeholder="Select a class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls.classId} value={cls.classId}>
                        {cls.classCode}: {cls.className}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="session">Select Session</Label>
                <Select value={selectedSession} onValueChange={setSelectedSession} disabled={!selectedClass || sessions.length === 0} required>
                  <SelectTrigger id="session">
                    <SelectValue placeholder={sessions.length === 0 ? "No absent sessions found" : "Select a session"} />
                  </SelectTrigger>
                  <SelectContent>
                    {sessions.map((session) => (
                      <SelectItem key={session.sessionId} value={session.sessionId}>
                        Session {session.sessionNumber} - {formatDate(session.date)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedClass && sessions.length === 0 && <p className="text-sm text-muted-foreground mt-1">No absent sessions found for this class.</p>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="reason">Reason for Complaint</Label>
                <Textarea id="reason" placeholder="Please explain why you believe your attendance was incorrectly marked as absent..." value={reason} onChange={(e) => setReason(e.target.value)} className="min-h-[120px]" required />
              </div>
            </div>

            <div className="mt-6">
              <Button type="submit" className="w-full" disabled={!selectedClass || !selectedSession || !reason.trim() || sessions.length === 0}>
                Submit Complaint
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
