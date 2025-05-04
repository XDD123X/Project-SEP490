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
import { analyzeSession, getSessionReporForLectureBySessionId } from "@/services/reportService";
import { Spinner } from "@/components/ui/spinner";

export default function ViewLecturerClassReportPage() {
  const { classId } = useParams();
  const navigate = useNavigate();

  const [sessions, setSessions] = useState([]);

  const [processingSessionId, setProcessingSessionId] = useState(null);
  const [openReportDialog, setOpenReportDialog] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  const [isLoadingView, setIsLoadingView] = useState(false);

  //fetch session by classId
  const fetchData = async () => {
    try {
      const response = await getSessionsByClassId(classId);
      if (response.status === 200) {
        setSessions(response.data);
      }
    } catch (error) {
      console.log(error);
      toast.error("failed while fetching session by classId");
    }
  };
  useEffect(() => {
    if (!classId) return;
    fetchData();
  }, [classId]);

  const handleAnalyze = async (sessionId) => {
    try {
      setProcessingSessionId(sessionId);
      console.log(sessionId);

      const analyzeResponse = await analyzeSession(sessionId);
      console.log("response:", analyzeResponse);

      if (analyzeResponse.status === 200) {
        toast.success("Record Analysis Request Sent Successfully");
        fetchData();
      } else if (analyzeResponse.status === 500) {
        toast.error("Can not connect to Server or AI Service. Pleasy try again.");
      }

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
    } else if (session.reports[0].status === 2 && session.reports[0].geminiResponse) {
      return (
        <Badge variant="success" className="bg-green-100 text-green-800 hover:bg-green-200">
          Completed
        </Badge>
      );
    } else if (session.reports[0].status === -1) {
      return <Badge variant="destructive">Error</Badge>;
    }

    return <Badge variant="outline">Unknown</Badge>;
  }

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

  const formatText = (input) => {
    if (!input) return "";

    // 1. Đổi \r\n thành <br/>
    let text = input.replace(/\n/g, "<br/>");

    // 2. Đổi **bold** thành <strong>bold</strong>
    text = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

    return text;
  };

  function getActionButton(session) {
    const canAnalyze = session.status === 2 && session.records && session.records.length > 0;

    if (!session.reports || session.reports.length === 0 || session.reports[0]?.status === -1) {
      const isReAnalyze = session.reports?.[0]?.status === -1;
      return (
        <Button onClick={() => handleAnalyze(session.sessionId)} disabled={!canAnalyze || processingSessionId === session.sessionId} size="sm">
          {processingSessionId === session.sessionId ? (
            <>
              <Spinner className="mr-2 h-4 w-4" />
              {isReAnalyze ? "Re-Analyzing..." : "Analyzing..."}
            </>
          ) : (
            <>
              <FileAnalytics className="mr-2 h-4 w-4" />
              {isReAnalyze ? "Re-Analyze" : "Analyze"}
            </>
          )}
        </Button>
      );
    } else if (session.reports[0]?.status === 1) {
      return (
        <Button disabled size="sm">
          <Spinner className="mr-2 h-4 w-4 text-primary-foreground" />
          Processing
        </Button>
      );
    } else if (session.reports[0]?.status === 2 && session.reports[0]?.geminiResponse) {
      return (
        <Button variant="outline" size="sm" onClick={() => handleViewReport(session)} disabled={isLoadingView}>
          {isLoadingView ? <Spinner className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
          {isLoadingView ? "Loading..." : "View Report"}
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
            {sessions.length > 0 ? (
              sessions
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
                ))
            ) : (
              <TableRow className="my-5">
                <TableCell colSpan={6} className="text-center ">
                  No Sessions Found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* detail dialog */}
      <Dialog open={openReportDialog} onOpenChange={setOpenReportDialog}>
        <DialogContent className="max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              Session {selectedReport?.sessionNumber} Report: {selectedReport?.description}
            </DialogTitle>
            <DialogDescription>Report summary generated from session recording and attendance data.</DialogDescription>
          </DialogHeader>
          <div className="p-4 bg-muted/30 rounded-md max-h-[300px] overflow-y-auto">
            <p className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: formatText(selectedReport?.summary || "") }}></p>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row sm:justify-end sm:space-x-2 gap-4">
            <Button variant="outline" onClick={() => setOpenReportDialog(false)}>
              Close
            </Button>
            {/* <Button onClick={handleDownloadReport}>
              <Download className="mr-2 h-4 w-4" />
              Download Details
            </Button> */}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
