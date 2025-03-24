import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Save, ArrowLeft, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { getSessionsByClassId } from "@/services/sessionService";
import { GetLecturerClassById } from "@/services/classService";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { format, isToday, parseISO } from "date-fns";
import { toast } from "sonner";
import { AddAttendance, UpdateAttendance } from "@/services/attendanceService";

export function AttendanceForm({ classId, sessionId }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [session, setSession] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [filter, setFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const navigate = useNavigate();

  const isNewSession = sessionId === "new" || sessionId === "new-session";

  useEffect(() => {
    async function fetchSessionData() {
      try {
        // For existing session, get the session data
        const sessions = await getSessionsByClassId(classId);
        const currentSession = sessions.data.find((s) => s.sessionId === sessionId);
        const classBySession = await GetLecturerClassById(currentSession.classId);

        if (currentSession) {
          setSession(currentSession);

          // Extract students
          const studentList = classBySession.data?.classStudents?.map((cs) => cs.student) || [];
          setStudents(studentList);

          // Initialize attendance from existing data
          const existingAttendance = {};
          currentSession.attendances?.forEach((a) => {
            existingAttendance[a.studentId] = {
              present: a.status === 1,
              note: a.note || "",
            };
          });

          // Ensure all students have an attendance record
          studentList.forEach((student) => {
            if (!existingAttendance[student.accountId]) {
              existingAttendance[student.accountId] = { present: false, note: "" };
            }
          });

          setAttendance(existingAttendance);
        }

        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch session data:", error);
        navigate("/404");
        setLoading(false);
      }
    }

    fetchSessionData();
  }, [classId, sessionId, isNewSession]);

  const handleToggleAttendance = (studentId) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        present: !prev[studentId].present,
      },
    }));
  };

  const handleNoteChange = (studentId, note) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        note,
      },
    }));
  };

  const handleSaveAttendance = async () => {
    setSaving(true);
    try {
      const attendanceData = Object.entries(attendance).map(([studentId, data]) => ({
        studentId,
        status: data.present ? 1 : 0,
        note: data.note,
      }));

      // Kiểm tra xem session đã có attendance hay chưa
      const hasExistingAttendance = session.attendances && session.attendances.length > 0;

      let response;
      if (hasExistingAttendance) {
        // Nếu có, thì cập nhật
        response = await UpdateAttendance(sessionId, attendanceData);
      } else {
        // Nếu chưa có, thì thêm mới
        response = await AddAttendance(sessionId, attendanceData);
      }

      if (response.status === 200) {
        toast.success("Attendance saved successfully!");
        navigate(`/lecturer/attendance/${classId}`);
      } else {
        toast.error("Failed to save attendance!");
      }
    } catch (error) {
      console.error("Failed to save attendance:", error);
      toast.error("An error occurred while saving attendance.");
    } finally {
      setSaving(false);
    }
  };
  
  const filteredStudents = students.filter((student) => {
    const nameMatch = student.fullName?.toLowerCase().includes(filter.toLowerCase());
    const idMatch = student.accountId?.toLowerCase().includes(filter.toLowerCase());

    // Tìm thông tin điểm danh của học sinh trong session.attendances
    const attendanceRecord = session?.attendances?.find(a => a.studentId === student.accountId);
    const status = attendanceRecord?.status;

    if (statusFilter === "all") return nameMatch || idMatch;
    if (statusFilter === "present") return (nameMatch || idMatch) && status === 1;
    if (statusFilter === "absent") return (nameMatch || idMatch) && status === 0;

    return nameMatch || idMatch;
});

  const presentCount = Object.values(attendance).filter((a) => a.present).length;
  const absentCount = Object.values(attendance).filter((a) => !a.present).length;

  const isTodaySession = isNewSession || (session && session.sessionDate ? isToday(parseISO(session.sessionDate)) : false);
  // const isReadOnly = !isTodaySession;
  // const isTodaySession = true;
  const isReadOnly = !isTodaySession;
  const hasAttendance = session?.attendances && session.attendances.length > 0;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading attendance data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => navigate("/lecturer/attendance")} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
      </Button>

      {isReadOnly && (
        <Alert variant="warning" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>View Only Mode</AlertTitle>
          <AlertDescription>This is a {session && new Date(session.date) < new Date() ? "past" : "future"} session. You can only view attendance but cannot make changes.</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>
                {isNewSession ? "New Attendance Session" : `Session #${session?.sessionNumber || ""}`}
                {isTodaySession && (
                  <Badge className="ml-2 mb-1" variant="outline">
                    Today
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>{format(session?.sessionDate, "EEEE - dd/MM/yyyy")}</CardDescription>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium">Present: {presentCount}</div>
              <div className="text-sm font-medium">Absent: {absentCount}</div>
              <div className="text-sm font-medium">Total: {students.length}</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Label htmlFor="filter">Search Students</Label>
              <Input id="filter" placeholder="Search by name or ID..." value={filter} onChange={(e) => setFilter(e.target.value)} />
            </div>
            <div className="w-full md:w-48">
              <Label htmlFor="status-filter">Status Filter</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status-filter">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="present">Present</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Present</TableHead>
                  <TableHead>Avatar</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead>Note</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      No students found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents.map((student) => (
                    <TableRow key={student.accountId}>
                      <TableCell>
                        <Checkbox checked={attendance[student.accountId]?.present || false} onCheckedChange={() => handleToggleAttendance(student.accountId)} disabled={isReadOnly} />
                      </TableCell>
                      <TableCell>
                        <Avatar>
                          <AvatarImage src={student.imgUrl} alt={student.fullName} />
                          <AvatarFallback>
                            {student.fullName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .substring(0, 2)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell>{student.fullName}</TableCell>
                      <TableCell className="hidden md:table-cell">{student.email}</TableCell>
                      <TableCell>
                        <Input placeholder="Add Note..." value={attendance[student.accountId]?.note || ""} onChange={(e) => handleNoteChange(student.accountId, e.target.value)} className="h-8" disabled={isReadOnly} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => navigate("/lecturer/attendance")}>
            Cancel
          </Button>
          {isTodaySession ? (
            <Button onClick={handleSaveAttendance} disabled={saving || isReadOnly}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" /> {hasAttendance ? "Update Attendance" : "Save Attendance"}
                </>
              )}
            </Button>
          ) : (
            <Button variant="outline" onClick={() => navigate("/lecturer/attendance/")}>
              Back to Dashboard
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
