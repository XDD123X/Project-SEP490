import { format } from "date-fns";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate, useParams } from "react-router-dom";
import { ClassBadge, SessionBadge } from "@/components/BadgeComponent";
import { useEffect, useState } from "react";
import { GetClassById } from "@/services/classService";
import { getSessionsByClassId } from "@/services/sessionService";
import { toast } from "sonner";

export default function ViewSessionByClassReportPage() {
  const { classId } = useParams();
  const [sessions, setSessions] = useState([]);
  const [classData, setClassData] = useState();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const responseClass = await GetClassById(classId);
        setClassData(responseClass.data);
        if (responseClass.status === 200) {
          const responseSession = await getSessionsByClassId(classId);
          console.log(responseSession.data);
          setSessions(responseSession.data);
        }
      } catch (error) {
        toast.error(error);
      }
    };
    fetchData();
  }, [classId]);

  if (!classData) {
    return <div className="container py-10">Class not found</div>;
  }

  return (
    <div className="container py-10">
      <Button className="mb-6 pl-0 flex items-center gap-2" onClick={() => navigate("/officer/report")}>
        <ArrowLeft className="w-4 h-4 mx-2" />
        Back to Classes
      </Button>

      <Card className="mb-8">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-2xl">{classData.className}</CardTitle>
            <ClassBadge status={classData.status} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Class Code</p>
              <p className="font-medium">{classData.classCode}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Lecturer</p>
              <p className="font-medium">{classData.lecturer.fullName}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Total Sessions</p>
              <p className="font-medium">{classData.totalSessions}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Start Date</p>
              <p className="font-medium">{classData.startDate ? format(classData.startDate, "MMM dd, yyyy") : "TBD"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">End Date</p>
              <p className="font-medium">{classData.endDate ? format(classData.endDate, "MMM dd, yyyy") : "TBD"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <h2 className="text-2xl font-bold mb-4">Sessions</h2>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Session #</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Recording</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sessions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-4">
                No sessions available
              </TableCell>
            </TableRow>
          ) : (
            sessions.map((session) => (
              <TableRow key={session.sessionId}>
                <TableCell>{session.sessionNumber}</TableCell>
                <TableCell>{format(session.sessionDate, "MMM dd, yyyy")}</TableCell>
                <TableCell>
                  {session.sessionRecording ? (
                    <a href={session.sessionRecording} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                      View <ExternalLink size={14} />
                    </a>
                  ) : (
                    <span className="text-muted-foreground">Not available</span>
                  )}
                </TableCell>
                <TableCell>
                  <SessionBadge status={session.status} />
                </TableCell>
                <TableCell className="text-right">
                  <Button size="sm" disabled={session.report} onClick={() => toast.warning(`Analyzing report for session ${session.sessionNumber}`)}>
                    Analyze
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
