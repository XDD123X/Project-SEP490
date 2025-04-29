/* eslint-disable react/prop-types */
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Video, ExternalLink, Info, VideoOff, BookOpen, User, Calendar, Clock, CircleCheck, File, FileChartColumnIncreasing, FileClock } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { format, isBefore, isSameDay } from "date-fns";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { Textarea } from "./ui/textarea";
import { cn } from "@/lib/utils";
import { Separator } from "./ui/separator";
import { SessionBadge } from "./BadgeComponent";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { downloadReportDetail } from "@/services/reportService";

export default function LecturerClassCard({ session }) {
  const navigate = useNavigate();
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [downloadingSessionId, setDownloadingSessionId] = useState(null);

  //take attendance handle
  const handleNavigate = () => {
    if (!session) {
      toast.error("Missing classId or sessionId");
      return;
    }
    navigate(`/lecturer/attendance/${session.class.classId}/${session.sessionId}`);
  };

  //take request change handle
  const handleRequestChange = () => {
    if (!session) {
      toast.error("Missing classId or sessionId");
      return;
    }
    navigate(`/lecturer/request/${session.class.classId}/${session.sessionId}`);
  };

  const handleDownloadReport = async (classData, report) => {
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

  return (
    <>
      <Card
        className={cn(
          "w-full max-w-xs overflow-hidden transition-shadow duration-500",
          session.status === 1 && "shadow-[0_0_4px_2px_#e5e7eb] hover:shadow-[0_0_10px_3px_#e5e7eb]",
          session.status === 2 && "shadow-[0_0_4px_2px_#4ade80] hover:shadow-[0_0_10px_3px_#4ade80]",
          session.status === 3 && "shadow-[0_0_4px_2px_#ef4444] hover:shadow-[0_0_10px_3px_#ef4444]"
        )}
      >
        <CardContent className="p-0">
          {/* Row 1: Class Name and Status Badge */}
          <div className="flex items-center justify-between px-3 py-2">
            <h3 className="text-xs font-medium">{session.class.classCode}</h3>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <a href={session.lecturer.meetUrl} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="ghost" className="h-5 w-5 p-0 rounded-full text-green-800">
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </a>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Join Online Meeting</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Separator />

          {/* Row 2: Lecturer Name */}
          <div className="border-b px-3 py-2 flex items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground flex-shrink-0">Lecturer:</p>
            {/* <Speech className="text-muted-foreground w-4 h-4" /> */}
            <span className="text-xs font-medium text-right truncate rtl">{session.lecturer.fullName}</span>
          </div>

          {/* Row 3: Combined Record Icon and Attendance Badge */}
          <div className="flex items-center justify-between border-b px-3 py-2">
            <div className="flex items-center">{session.sessionRecord ? <Video className={`h-4 w-4 text-green-500 `} /> : <VideoOff className={`h-4 w-4 text-red-500 `} />}</div>
            <div className="h-4 border-r mx-2"></div>
            <Badge
              variant={session.status === 2 ? "success" : session.status === 3 ? "destructive" : "outline"}
              className={`text-xs px-1.5 py-0 ${session.status === 2 ? "bg-green-100 text-green-800 hover:bg-green-100" : session.status === 3 ? "bg-red-100 text-red-800 hover:bg-red-100" : "bg-gray-100 text-gray-800 hover:bg-gray-100"}`}
            >
              {session.status === 2 ? "Finished" : session.status === 3 ? "Cancelled" : "Not yet"}
            </Badge>
          </div>

          {session.description && (
            <div className="border-b px-3 py-2">
              <p className="text-xs text-muted-foreground">Note:</p>
              <p className="text-xs font-medium text-green-500">{session.description}</p>
            </div>
          )}

          <div className="flex flex-col gap-2 p-2">
            <Button variant="outline" size="sm" className="w-full h-7 text-xs justify-center" onClick={() => setIsDetailOpen(true)}>
              <Info className="mr-1 h-3 w-3" />
              Detail
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              <span>Session #{session.sessionNumber}</span>
            </DialogTitle>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="space-y-3">
              {/* Class Code */}
              <div className="flex items-center">
                <div className="w-1/3 flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <span className="font-semibold">Class Code:</span>
                </div>
                <div className="w-2/3">{session.class.classCode}</div>
              </div>

              {/* Class Name */}
              <div className="flex items-center">
                <div className="w-1/3 flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <span className="font-semibold">Class Name:</span>
                </div>
                <div className="w-2/3">{session.class.className}</div>
              </div>

              {/* Lecturer */}
              <div className="flex items-center">
                <div className="w-1/3 flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  <span className="font-semibold">Lecturer:</span>
                </div>
                <div className="w-2/3">{session.class.lecturer.fullName}</div>
              </div>

              {/* Date */}
              <div className="flex items-center">
                <div className="w-1/3 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="font-semibold">Date:</span>
                </div>
                <div className="w-2/3">{format(session.sessionDate, "dd/MM/yyyy")}</div>
              </div>

              {/* Slot */}
              <div className="flex items-center">
                <div className="w-1/3 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="font-semibold">Slot:</span>
                </div>
                <div className="w-2/3">{session.slot}</div>
              </div>

              {/* Status */}
              <div className="flex items-center">
                <div className="w-1/3 flex items-center gap-2">
                  <CircleCheck className="h-4 w-4 text-primary" />
                  <span className="font-semibold">Status:</span>
                </div>
                <div className="w-2/3">
                  <SessionBadge status={session.status} />
                </div>
              </div>

              {/* Description */}
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <span className="font-semibold">Description:</span>
                </div>
                <Textarea value={session.description || "No description available"} readOnly className="resize-none bg-muted" />
              </div>

              {/* Recording */}
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <span className="font-semibold">Recording:</span>
                </div>
                <div className="bg-muted p-3 rounded-md">
                  {session.sessionRecord ? (
                    <div className="flex justify-between items-center gap-4">
                      <p className="flex items-center gap-2">
                        <Video className="h-5 w-5 text-green-500" />
                        <span>Recording available</span>
                      </p>
                      <Link to={`/record/${session.sessionId || ""}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline">
                        <Button>
                          <ExternalLink className="h-4 w-4" />
                          View Record
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <p className="flex items-center gap-2 text-muted-foreground">
                      <VideoOff className="h-5 w-5" />
                      <span>No recording available</span>
                    </p>
                  )}
                </div>
              </div>
              {/* Report */}
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <span className="font-semibold">Report:</span>
                </div>
                <div className="bg-muted p-3 rounded-md">
                  {session.reports.length > 0 ? (
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <FileChartColumnIncreasing className="h-5 w-5 text-green-500" />
                        <span className="text-sm">Generated: {format(session.reports[0].generatedAt, "HH:mm, dd/MM/yyyy")}</span>
                      </div>
                      <Button size="sm" onClick={() => handleDownloadReport(session.class, session.reports[0])} disabled={downloadingSessionId === session.sessionId}>
                        {downloadingSessionId === session.sessionId ? (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin mr-1">
                              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                            </svg>
                            Generating Report...
                          </>
                        ) : (
                          "Download"
                        )}
                      </Button>
                    </div>
                  ) : (
                    <p className="flex items-center gap-2 text-muted-foreground">
                      <FileClock className="h-5 w-5" />
                      <span>No report available</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-wrap gap-2 sm:justify-end pt-2">
            {session.status === 1 && (
              <>
                {isBefore(new Date(), new Date(session.sessionDate)) && (
                  <Button variant="outline" size="sm" onClick={handleRequestChange}>
                    Request Change
                  </Button>
                )}

                {isSameDay(new Date(), new Date(session.sessionDate)) && (
                  <Button variant="outline" size="sm" onClick={handleNavigate}>
                    Take Attendance
                  </Button>
                )}
              </>
            )}

            {session.sessionRecord === null ? (
              session.status === 2 && (
                <Button variant="default" size="sm">
                  Upload Record
                </Button>
              )
            ) : (
              <Button variant="default" size="sm">
                Edit Record
              </Button>
            )}

            {isSameDay(session.sessionDate) && (
              <Button variant="default" size="sm">
                Edit Attendance
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
