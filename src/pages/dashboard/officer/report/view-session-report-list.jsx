import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle, LoaderCircle, XCircle } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { GetClassById } from "@/services/classService";
import { getSessionsByClassId } from "@/services/sessionService";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { getAccountById } from "@/services/accountService";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { downloadReportDetail } from "@/services/reportService";
import { cn } from "@/lib/utils";

export default function ViewSessionByClassReportPage() {
  const { classId } = useParams();
  const [classData, setClassData] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [reports, setReports] = useState([]);
  const [downloadingSessionId, setDownloadingSessionId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const classResponse = await GetClassById(classId);
        const sessionResponse = await getSessionsByClassId(classId);

        if (classResponse.status === 200) {
          const sessionData = sessionResponse.data;

          setClassData(classResponse.data);
          setSessions(sessionData); // cập nhật state

          const filteredReports = sessionData.filter((session) => session.reports && session.reports.length > 0).flatMap((session) => session.reports);

          setReports(filteredReports);
        }
      } catch (error) {
        toast.error("Lỗi khi tải dữ liệu lớp học.");
        console.error(error);
      }
    };

    fetchData();
  }, [classId]);

  const handleDownloadReport = async (report) => {
    setDownloadingSessionId(report.session.sessionId);
    try {
      const response = await downloadReportDetail(report.session.sessionId);

      const disposition = response.headers["content-disposition"];
      let fileName = `report_${classData.classCode.replace("/", "")}_session${report.session.sessionNumber}_${format(new Date(), "HH-mm_dd/MM/yyyy")}.docx`;
      if (disposition && disposition.includes("filename=")) {
        fileName = disposition.split("filename=")[1].replace(/['"]/g, "").trim();
      }

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success("Report downloaded!");
    } catch (error) {
      console.error("Failed to download report:", error);
      toast.error("Failed to download report.");
    } finally {
      setDownloadingSessionId(null);
    }
  };

  if (!classData && !sessions && !reports) {
    return (
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center mb-6">
        <Link to="/officer/report">
          <Button variant="outline" size="icon" className="mr-4">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">{classData.classCode} Reports</h1>
      </div>

      <div className="mb-4">
        <p className="text-muted-foreground">Lecturer: {classData.lecturer?.fullName || "N/A"}</p>
        <p className="text-muted-foreground">Total Reports: {sessions.length}</p>
      </div>

      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Session</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Attendance</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports && reports.length > 0 ? (
                reports.map((report) => (
                  <TableRow key={report.reportId}>
                    <TableCell>Session {report.session.sessionNumber}</TableCell>
                    <TableCell>Slot {report.session.slot}</TableCell>
                    <TableCell>{format(report.session.sessionDate, "EEEE, dd/MM/yyyy")}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center">
                          <CheckCircle className="mr-1 h-4 w-4 text-green-500" />
                          <span>{report.session.attendances?.filter((a) => a.status === 1).length || 0}</span>
                        </div>
                        <div className="flex items-center">
                          <XCircle className="mr-1 h-4 w-4 text-red-500" />
                          <span>{report.session.attendances?.filter((a) => a.status === 0).length || 0}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" onClick={() => handleDownloadReport(report)} disabled={downloadingSessionId === report.sessionId}>
                        {downloadingSessionId === report.sessionId ? (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn("animate-spin")}>
                              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                            </svg>
                            Generating Report...
                          </>
                        ) : (
                          "Download Report"
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No record analyzed yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
