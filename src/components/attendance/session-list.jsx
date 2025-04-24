import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, XCircle, Edit, Eye, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getSessionsByClassId } from "@/services/sessionService";
import { format, isFuture, isPast, isToday, parseISO } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const slotTimeMap = {
  1: "09:00 AM - 10:30 AM",
  2: "11:00 AM - 12:30 PM",
  3: "14:00 PM - 15:30 PM",
  4: "16:00 PM - 17:30 PM",
};

const getSessionTime = (slot) => slotTimeMap[slot] || "Unknown Slot";

export function AttendanceSessionList({ classId, onTakeAttendance }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState("10");

  // Pagination calculations
  const totalSessions = sessions.length;
  const totalPages = Math.ceil(totalSessions / Number.parseInt(rowsPerPage));
  const startIndex = (currentPage - 1) * Number.parseInt(rowsPerPage);
  const endIndex = Math.min(startIndex + Number.parseInt(rowsPerPage), totalSessions);

  useEffect(() => {
    async function fetchSessions() {
      try {
        const sessionList = await getSessionsByClassId(classId);

        setSessions(sessionList.data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch sessions:", error);
        setLoading(false);
      }
    }

    fetchSessions();
  }, [classId]);

  useEffect(() => {
    if (sessions.length > 0) {
      const todayIndex = sessions.findIndex((session) => isToday(parseISO(session.sessionDate)));

      if (todayIndex !== -1) {
        setCurrentPage(Math.floor(todayIndex / rowsPerPage) + 1);
      } else {
        setCurrentPage(1);
      }
    }
  }, [sessions, rowsPerPage]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading sessions...</span>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg bg-muted/50">
        <p className="text-muted-foreground">No sessions found for this class</p>
      </div>
    );
  }

  // Sort sessions: Today first, then future, then past
  const sortedSessions = [...sessions].sort((a, b) => {
    const dateA = new Date(a.sessionDate).getTime();
    const dateB = new Date(b.sessionDate).getTime();

    if (dateA !== dateB) {
      return dateA - dateB;
    }

    return a.slot - b.slot;
  });

  // Get current page data
  const currentPageData = sortedSessions.slice(startIndex, endIndex);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Sessions</h3>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Session #</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Attendance</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentPageData.map((session) => {
              const isTodaySession = isToday(parseISO(session.sessionDate));
              const hasAttendance = session.attendances && session.attendances.length > 0;

              return (
                <TableRow key={session.sessionId} className={isTodaySession ? "bg-primary/5" : ""}>
                  <TableCell className="font-medium">{session.sessionNumber}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {format(session.sessionDate, "EEEE - dd/MM/yyyy")}
                      {isTodaySession && (
                        <Badge variant="default" className="ml-2">
                          Today
                        </Badge>
                      )}
                      {isFuture(parseISO(session.sessionDate)) && !isTodaySession && (
                        <Badge variant="secondary" className="ml-2">
                          Upcoming
                        </Badge>
                      )}
                      {isPast(parseISO(session.sessionDate)) && !isTodaySession && (
                        <Badge variant="outline" className="ml-2">
                          Past
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getSessionTime(session.slot)}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {/* Buổi học đã qua và không phải hôm nay */}
                      {isPast(parseISO(session.sessionDate)) && !isTodaySession && (
                        <Badge variant="destructive" className="w-fit">
                          Closed
                        </Badge>
                      )}

                      {/* Buổi học sắp tới và không phải hôm nay */}
                      {isFuture(parseISO(session.sessionDate)) && !isTodaySession && (
                        <Badge variant="secondary" className="w-fit">
                          Upcoming
                        </Badge>
                      )}

                      {/* Buổi học là hôm nay */}
                      {isTodaySession && <Badge className="w-fit">{session.status === 2 || session.status === 1 ? "Open" : "Closed"}</Badge>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center gap-4 text-muted-foreground">
                      {session.attendances && session.attendances.length > 0 ? (
                        <>
                          <div className="flex items-center">
                            <CheckCircle className="mr-1 h-4 w-4 text-green-500" />
                            <span>{session.attendances?.filter((a) => a.status === 1).length || 0}</span>
                          </div>
                          <div className="flex items-center">
                            <XCircle className="mr-1 h-4 w-4 text-red-500" />
                            <span>{session.attendances?.filter((a) => a.status === 0).length || 0}</span>
                          </div>
                        </>
                      ) : (
                        <span>Not Yet</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant={isTodaySession ? "default" : "outline"} onClick={() => onTakeAttendance(classId, session.sessionId)}>
                      {isTodaySession ? (
                        <>
                          {hasAttendance ? (
                            <>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </>
                          ) : (
                            <>
                              <Check className="mr-2 h-4 w-4" />
                              Take
                            </>
                          )}
                        </>
                      ) : (
                        <>
                          <Eye className="mr-2 h-4 w-4" /> View
                        </>
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      {/* Pagination Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Rows per page</span>
          <Select value={rowsPerPage} onValueChange={setRowsPerPage}>
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={rowsPerPage} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-6">
          <span className="text-sm text-muted-foreground">
            {startIndex + 1}-{endIndex} of {totalSessions}
          </span>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
