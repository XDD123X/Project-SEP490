import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, FileScanIcon as FileAnalytics, Eye, Download } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import { SessionBadge } from "@/components/BadgeComponent";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function ViewLecturerClassReportPage() {
  const { classId } = useParams();
  const navigate = useNavigate();

  const [sessions, setSessions] = useState([
    {
      sessionId: "8294d74e-92ea-4ba9-b9b3-7a1c2348cbcf",
      sessionNumber: 1,
      classId: "0824c5a5-bf09-4e45-83da-2a2d8fb37351",
      lecturerId: "13924b12-c83a-4d46-904b-a5634eea342b",
      sessionDate: "2025-04-24T00:00:00",
      slot: 2,
      description: "Recorded By Not Analyze Yet",
      sessionRecord: "2025-04-23T02:29:21.713",
      type: 1,
      status: 2,
      createdAt: "2025-04-24T02:29:21.713",
      updatedAt: "2025-04-24T19:13:48.643",
      class: null,
      lecturer: null,
      attendances: [
        {
          studentId: "3d66cb42-5b4d-45c8-9c49-c56168f2ecc8",
          status: 1,
          note: "",
        },
        {
          studentId: "374cebf4-8386-497a-8fd7-a50e6fa881fc",
          status: 1,
          note: "",
        },
      ],
      records: [{ id: "rec-1", url: "https://example.com/recording1" }],
      files: [],
      reports: null,
    },
    {
      sessionId: "9394d74e-92ea-4ba9-b9b3-7a1c2348cbdg",
      sessionNumber: 2,
      classId: "0824c5a5-bf09-4e45-83da-2a2d8fb37351",
      lecturerId: "13924b12-c83a-4d46-904b-a5634eea342b",
      sessionDate: "2025-04-26T00:00:00",
      slot: 3,
      description: "Recorded and Processing Analyze",
      sessionRecord: "2025-04-26T15:30:00",
      type: 1,
      status: 2, // Status 2 with records to enable analyze
      createdAt: "2025-04-26T02:29:21.713",
      updatedAt: "2025-04-26T19:13:48.643",
      class: null,
      lecturer: null,
      attendances: [
        {
          studentId: "3d66cb42-5b4d-45c8-9c49-c56168f2ecc8",
          status: 1,
          note: "",
        },
        {
          studentId: "374cebf4-8386-497a-8fd7-a50e6fa881fc",
          status: 1,
          note: "",
        },
      ],
      records: [{ id: "rec-1", url: "https://example.com/recording1" }],
      files: [],
      reports: [
        {
          reportId: "1234d74e-92ea-4ba9-b9b3-7a1c2348abcd",
          status: 1,
          summary: null,
        },
      ],
    },
    {
      sessionId: "7694d74e-92ea-4ba9-b9b3-7a1c2348cbeh",
      sessionNumber: 3,
      classId: "0824c5a5-bf09-4e45-83da-2a2d8fb37351",
      lecturerId: "13924b12-c83a-4d46-904b-a5634eea342b",
      sessionDate: "2025-04-28T00:00:00",
      slot: 2,
      description: "Both Recorded And Analyzed",
      sessionRecord: "2025-04-28T14:00:00",
      type: 1,
      status: 2, // Status 2 with records to enable analyze
      createdAt: "2025-04-28T02:29:21.713",
      updatedAt: "2025-04-28T19:13:48.643",
      class: null,
      lecturer: null,
      attendances: [
        {
          studentId: "3d66cb42-5b4d-45c8-9c49-c56168f2ecc8",
          status: 1,
          note: "",
        },
        {
          studentId: "374cebf4-8386-497a-8fd7-a50e6fa881fc",
          status: 1,
          note: "",
        },
      ],
      records: [{ id: "rec-2", url: "https://example.com/recording2" }],
      files: [],
      reports: [
        {
          reportId: "5678d74e-92ea-4ba9-b9b3-7a1c2348efgh",
          status: 2,
          summary:
            "This session covered Entity Framework Core fundamentals including DbContext, migrations, and CRUD operations. Students demonstrated good understanding of the concepts. The attendance rate was 100% and engagement levels were high throughout the session. Students asked insightful questions about database relationships and performance optimization techniques.",
        },
      ],
    },
    {
      sessionId: "5594d74e-92ea-4ba9-b9b3-7a1c2348cbij",
      sessionNumber: 4,
      classId: "0824c5a5-bf09-4e45-83da-2a2d8fb37351",
      lecturerId: "13924b12-c83a-4d46-904b-a5634eea342b",
      sessionDate: "2025-04-30T00:00:00",
      slot: 3,
      description: "Not Recorded Yet",
      sessionRecord: null,
      type: 1,
      status: 2, // Status 2 but no records to test disabled analyze
      createdAt: "2025-04-30T02:29:21.713",
      updatedAt: "2025-04-30T19:13:48.643",
      class: null,
      lecturer: null,
      attendances: [
        {
          studentId: "3d66cb42-5b4d-45c8-9c49-c56168f2ecc8",
          status: 1,
          note: "",
        },
        {
          studentId: "374cebf4-8386-497a-8fd7-a50e6fa881fc",
          status: 1,
          note: "",
        },
      ],
      records: [],
      files: [],
      reports: null,
    },
    {
      sessionId: "5594d74e-92ea-4ba9-b9b3-7a1c2348cbij",
      sessionNumber: 4,
      classId: "0824c5a5-bf09-4e45-83da-2a2d8fb37351",
      lecturerId: "13924b12-c83a-4d46-904b-a5634eea342b",
      sessionDate: "2025-04-30T00:00:00",
      slot: 3,
      description: "Not Finished Yet",
      sessionRecord: null,
      type: 1,
      status: 1, // Status 2 but no records to test disabled analyze
      createdAt: "2025-04-30T02:29:21.713",
      updatedAt: "2025-04-30T19:13:48.643",
      class: null,
      lecturer: null,
      attendances: [
        {
          studentId: "3d66cb42-5b4d-45c8-9c49-c56168f2ecc8",
          status: 1,
          note: "",
        },
        {
          studentId: "374cebf4-8386-497a-8fd7-a50e6fa881fc",
          status: 1,
          note: "",
        },
      ],
      records: [],
      files: [],
      reports: null,
    },
  ]);

  const [processingSessionId, setProcessingSessionId] = useState(null);
  const [openReportDialog, setOpenReportDialog] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  const handleAnalyze = (sessionId) => {
    setProcessingSessionId(sessionId);

    // Simulate processing delay
    setTimeout(() => {
      setSessions((prevSessions) =>
        prevSessions.map((session) => {
          if (session.sessionId === sessionId) {
            return {
              ...session,
              reports: [
                {
                  reportId: `${Math.random().toString(36).substring(2, 15)}`,
                  status: 1,
                  summary: null,
                },
              ],
            };
          }
          return session;
        })
      );

      // Simulate completion after another delay
      setTimeout(() => {
        setSessions((prevSessions) =>
          prevSessions.map((session) => {
            if (session.sessionId === sessionId) {
              return {
                ...session,
                reports: [
                  {
                    reportId: `${Math.random().toString(36).substring(2, 15)}`,
                    status: 2,
                    summary: `Generated report for session ${session.sessionNumber}: ${session.description}. The session was successful with all students attending. The material was well-received and students demonstrated understanding of the key concepts presented.`,
                  },
                ],
              };
            }
            return session;
          })
        );
        setProcessingSessionId(null);
      }, 5000);
    }, 5000);
  };

  function formatDate(dateString) {
    return format(dateString, "dd/MM/yyyy");
  }

  function getSessionStatusBadge(session) {
    if (!session.reports) {
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

    if (!session.reports) {
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
    } else if (session.reports[0].status === 1) {
      return (
        <Button disabled size="sm">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing
        </Button>
      );
    } else if (session.reports[0].status === 2 && session.reports[0].summary) {
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
              <TableHead>Description</TableHead>
              <TableHead>Slot</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Record</TableHead>

              <TableHead>Status</TableHead>
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
                    {session.description} <SessionBadge status={session.status} />{" "}
                  </TableCell>
                  <TableCell>{session.slot}</TableCell>
                  <TableCell>{formatDate(session.sessionDate)}</TableCell>
                  <TableCell>{session.sessionRecord ? formatDate(session.sessionRecord) : "Not recorded"}</TableCell>
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
