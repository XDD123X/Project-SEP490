import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Eye, Download, FileText, FileX2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useNavigate, useParams } from "react-router-dom";
import { Spinner } from "@/components/ui/spinner";
import { format } from "date-fns";
import { toast } from "sonner";
import { getSessionReporForLectureBySessionId } from "@/services/reportService";
import { getSessionsByClassId } from "@/services/sessionService";

export default function ViewOfficerSessionReportPage() {
  const { classId } = useParams();
  const navigate = useNavigate();

  const [sessions, setSessions] = useState([]);

  const [openReportDialog, setOpenReportDialog] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isLoadingView, setIsLoadingView] = useState(false);

  //fetch data
  useEffect(() => {
    if (!classId) {
      toast.error("Invalid Class ID");
      return;
    }

    const fetchData = async () => {
      try {
        const response = await getSessionsByClassId(classId);
        if (response.status === 200) {
          setSessions(response.data);
        }
      } catch (error) {
        console.log(error);
        toast.error("Failed to fetch session data");
      }
    };
    fetchData();
  }, [classId]);

  const handleViewReport = async (session) => {
    try {
      setIsLoadingView(true);

      const response = await getSessionReporForLectureBySessionId(session.sessionId);
      console.log(response);

      if (response.status === 200) {
        setSelectedReport({
          sessionNumber: session.sessionNumber,
          description: session.description,
          summary: response.data.geminiResponse,
          data: session.reports[0].analysisData,
          status: response.data.status,
        });
      }

      setOpenReportDialog(true);
      setIsLoadingView(false);
    } catch (error) {
      setIsLoadingView(false);
      console.log(error);
    }
  };

  function formatDate(dateString) {
    if (!dateString) return "TBD";
    return format(dateString, "HH:mm dd/MM/yyyy");
  }

  function getSessionStatusBadge(session) {
    if (!session.reports || session.reports.length === 0) {
      return <Badge variant="outline">No Report</Badge>;
    }

    const firstReport = session.reports[0];

    if (firstReport.status === 1) {
      return <Badge variant="secondary">Processing</Badge>;
    } else if (firstReport.status === 2 && firstReport.summary) {
      return (
        <Badge variant="success" className="bg-green-100 text-green-800 hover:bg-green-200">
          Completed
        </Badge>
      );
    }

    return <Badge variant="outline">Unknown</Badge>;
  }

  function getActionButton(session) {
    // Check if reports is empty or not present
    if (!session.reports || session.reports.length === 0) {
      return (
        <Button disabled size="sm">
          <FileX2 className="mr-2 h-4 w-4" />
          No Report
        </Button>
      );
    }

    const firstReport = session.reports[0];

    // Officers can only view completed reports
    if (session.reports[0]?.status === 2 && session.reports[0]?.geminiResponse) {
      return (
        <Button variant="outline" size="sm" onClick={() => handleViewReport(session)} disabled={isLoadingView}>
          {isLoadingView ? <Spinner className="mr-2 h-4 w-4 animate-spin" /> : <Eye className="mr-2 h-4 w-4" />}
          {isLoadingView ? "Loading..." : "View Report"}
        </Button>
      );
    }

    // If the report is in progress
    if (firstReport.status === 1) {
      return (
        <Button disabled size="sm">
          <Spinner className="text-primary-foreground" />
          In Progress
        </Button>
      );
    }

    // Default for all other states
    return (
      <Button disabled size="sm">
        <FileText className="mr-2 h-4 w-4" />
        Unavailable
      </Button>
    );
  }

  const formatText = (input) => {
    if (!input) return "";

    // 1. Đổi \r\n thành <br/>
    let text = input.replace(/\n/g, "<br/>");

    // 2. Đổi **bold** thành <strong>bold</strong>
    text = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

    return text;
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col gap-2 mb-6">
        <div className="flex items-center">
          <Button variant="outline" onClick={() => navigate("/officer/reports")} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Classes
          </Button>
          <h1 className="text-3xl font-bold">Session Reports</h1>
        </div>

        {sessions.length > 0 && sessions[0].class && (
          <div className="bg-muted/30 p-4 rounded-md">
            <h2 className="font-semibold text-lg">
              {sessions[0].class.classCode}: {sessions[0].class.className}
            </h2>
            <p className="text-sm text-muted-foreground">Lecturer: {sessions[0].lecturer?.fullName}</p>
          </div>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Session</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Record</TableHead>
              <TableHead>Slot</TableHead>
              <TableHead>Attendances</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions && sessions.length > 0 ? (
              sessions
                .filter((session) => session.classId === classId)
                .sort((a, b) => a.sessionNumber - b.sessionNumber)
                .map((session) => (
                  <TableRow key={session.sessionId}>
                    <TableCell className="font-medium">Session {session.sessionNumber}</TableCell>
                    <TableCell>{session.description}</TableCell>
                    <TableCell>{formatDate(session.sessionDate)}</TableCell>
                    <TableCell>{session.sessionRecord ? formatDate(session.sessionRecord) : "Not recorded"}</TableCell>
                    <TableCell>{session.slot}</TableCell>
                    <TableCell>{session.attendances.length} students</TableCell>
                    <TableCell>{getSessionStatusBadge(session)}</TableCell>
                    <TableCell>{getActionButton(session)}</TableCell>
                  </TableRow>
                ))
            ) : (
              <TableRow className="">
                <TableCell colSpan={8} className="font-medium text-center">
                  No Sessions Found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* detail report dialog */}
      <Dialog open={openReportDialog} onOpenChange={setOpenReportDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Session {selectedReport?.sessionNumber} Report: {selectedReport?.description}
            </DialogTitle>
            <DialogDescription>Report summary generated from session recording and attendance data.</DialogDescription>
          </DialogHeader>
          <div className="p-4 bg-muted/30 rounded-md max-h-[300px] overflow-y-auto">
            <p className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: formatText(selectedReport?.summary || "") }}></p>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row sm:justify-end sm:space-x-2">
            <Button variant="outline" onClick={() => setOpenReportDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
