import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, FileScanIcon as FileAnalytics, Eye, Download, Video, VideoOff } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import { SessionBadge } from "@/components/BadgeComponent";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { getSessionsByClassId } from "@/services/sessionService";

export default function ViewLecturerClassReportPage() {
  const { classId } = useParams();
  const navigate = useNavigate();

  const [sessions, setSessions] = useState([]);

  const [processingSessionId, setProcessingSessionId] = useState(null);
  const [openReportDialog, setOpenReportDialog] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  //fetch session by classId
  useEffect(() => {
    if (!classId) return;
    const fetchData = async () => {
      try {
        const response = await getSessionsByClassId(classId);
        if (response.status === 200) {
          setSessions(response.data);
          console.log(response.data);
        }
      } catch (error) {
        console.log(error);
        toast.error("failed while fetching session by classId");
      }
    };
    fetchData();
  }, [classId]);

  const handleAnalyze = async (sessionId) => {
    try {
      setProcessingSessionId(sessionId);

      setProcessingSessionId(null);
    } catch (error) {
      console.log(error);
      setProcessingSessionId(null);
      toast.error("Failed Analyze Record");
    }
  };

  function formatDate(dateString) {
    return format(dateString, "HH:mm:ss dd/MM/yyyy");
  }

  function getSessionStatusBadge(session) {
    if (!session.reports || session.reports.length === 0) {
      return <Badge variant="outline">No Report</Badge>;
    } else if (session.reports[0].status === 1) {
      return <Badge variant="secondary">Processing</Badge>;
    } else if (session.reports[0].status === 2 && session.reports[0].summary) {
      return (
        <Badge variant="success" className="bg-green-100 text-green-800 hover:bg-green-200">
          Completed
        </Badge>
      );
    }
    return <Badge variant="outline">Unknown</Badge>;
  }

  const handleViewReport = (session) => {
    setSelectedReport({
      sessionNumber: session.sessionNumber,
      description: session.description,
      summary: session.reports[0].summary,
    });
    setOpenReportDialog(true);
  };

  const handleDownloadReport = () => {
    // In a real application, this would trigger a download of a detailed report
    alert("Downloading detailed report...");
    // You could implement actual download functionality here
  };

  function getActionButton(session) {
    const canAnalyze = session.status === 2 && session.records && session.records.length > 0;

    if (!session.reports || session.reports.length === 0) {
      return (
        <Button onClick={() => handleAnalyze(session.sessionId)} disabled={!canAnalyze || processingSessionId === session.sessionId} size="sm">
          {processingSessionId === session.sessionId ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <FileAnalytics className="mr-2 h-4 w-4" />
              Analyze
            </>
          )}
        </Button>
      );
    } else if (session.reports[0]?.status === 1) {
      return (
        <Button disabled size="sm">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing
        </Button>
      );
    } else if (session.reports[0]?.status === 2 && session.reports[0]?.summary) {
      return (
        <Button variant="outline" size="sm" onClick={() => handleViewReport(session)}>
          <Eye className="mr-2 h-4 w-4" />
          View Report
        </Button>
      );
    }
    return (
      <Button disabled size="sm">
        Unknown Status
      </Button>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center mb-6">
        <Button variant="outline" onClick={() => navigate("/lecturer/reports")} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Classes
        </Button>
        <h1 className="text-3xl font-bold">Session Reports</h1>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Session</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Record</TableHead>

              <TableHead>Analyze Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions
              .filter((session) => session.classId === classId)
              .sort((a, b) => a.sessionNumber - b.sessionNumber)
              .map((session) => (
                <TableRow key={session.sessionId}>
                  <TableCell className="font-medium">{session.sessionNumber}</TableCell>
                  <TableCell>
                    <SessionBadge status={session.status} />
                  </TableCell>
                  <TableCell>
                    Slot {session.slot}, {format(session.sessionDate, "dd/MM/yyyy")}
                  </TableCell>
                  <TableCell>
                    {session.sessionRecord ? (
                      <div className="flex items-center gap-2">
                        <Video className="w-4 h-4 text-green-500" />
                        {formatDate(session.sessionRecord)}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <VideoOff className="w-4 h-4 text-red-500" />
                        Not recorded
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{getSessionStatusBadge(session)}</TableCell>
                  <TableCell>{getActionButton(session)}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      {/* detail dialog */}
      <Dialog open={openReportDialog} onOpenChange={setOpenReportDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Session {selectedReport?.sessionNumber} Report: {selectedReport?.description}
            </DialogTitle>
            <DialogDescription>Report summary generated from session recording and attendance data.</DialogDescription>
          </DialogHeader>
          <div className="p-4 bg-muted/30 rounded-md max-h-[300px] overflow-y-auto">
            <p className="text-sm leading-relaxed">{selectedReport?.summary}</p>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row sm:justify-between sm:space-x-2">
            <Button variant="outline" onClick={() => setOpenReportDialog(false)}>
              Close
            </Button>
            <Button onClick={handleDownloadReport}>
              <Download className="mr-2 h-4 w-4" />
              Download Details
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
