import { useState, useEffect } from "react";
import { format, isBefore, isPast, isToday, startOfDay, startOfToday } from "date-fns";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, MailPlus, MailX, MailCheck, Clock, CheckCircle, XCircle } from "lucide-react";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate, useParams } from "react-router-dom";
import { GetClassById } from "@/services/classService";
import { getSessionsByClassId } from "@/services/sessionService";
import { toast } from "sonner";
import { SessionBadge } from "@/components/BadgeComponent";
import { GetRequestByLecturerId } from "@/services/studentRequestService";
import { useStore } from "@/services/StoreContext";

export default function ViewRequestBySessionLecturerPage() {
  const navigate = useNavigate();
  const { classId } = useParams();
  const [classData, setClassData] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "ascending" });
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState("5");
  const { state } = useStore();
  const { user } = state;

  useEffect(() => {
    if (classId === null || classId.trim === "") {
      navigate("/404");
    }
    const fetchData = async () => {
      try {
        const responseClass = await GetClassById(classId);

        if (responseClass.status === 200) {
          setClassData(responseClass.data);

          const responseSession = await getSessionsByClassId(responseClass.data.classId);
          const responseRequest = await GetRequestByLecturerId(user.uid);

          const requests = Array.isArray(responseRequest.data) ? responseRequest.data : [];

          const mergedSessions = responseSession.data.map((session) => {
            // Lọc ra các request có sessionId trùng với session hiện tại
            const matchingRequests = requests.filter((r) => r.sessionId === session.sessionId);

            // Nếu có trùng, lấy phần tử có approvedDate lớn nhất (muộn nhất)
            const latestRequest =
              matchingRequests.length > 0
                ? matchingRequests.reduce((latest, current) => {
                    const latestDate = new Date(latest.approvedDate ?? 0);
                    const currentDate = new Date(current.approvedDate ?? 0);
                    return currentDate > latestDate ? current : latest;
                  })
                : null;

            // Gộp thông tin request vào session
            return {
              ...session,
              request: latestRequest,
            };
          });

          setSessions(mergedSessions);
        }
      } catch (error) {
        toast.error("Failed to fetch Session By Class Id");
        console.log(error);
      }
    };
    fetchData();
  }, [classId, navigate]);

  const requestable = (session) => {
    if (session.type !== 1 || session.status === 2) return false;
    const sessionDate = new Date(session.sessionDate);
    const todayStart = startOfToday();
    const inPast = isBefore(sessionDate, todayStart);
    return !inPast;
  };

  const sortedSessions = [...sessions].sort((a, b) => {
    if (!sortConfig.key) return 0;

    if (sortConfig.key === "sessionDate") {
      return sortConfig.direction === "ascending" ? a.sessionDate.getTime() - b.sessionDate.getTime() : b.sessionDate.getTime() - a.sessionDate.getTime();
    }

    if (sortConfig.key === "slot") {
      return sortConfig.direction === "ascending" ? a.slot - b.slot : b.slot - a.slot;
    }

    return 0;
  });

  const totalPages = Math.ceil(sortedSessions.length / Number.parseInt(rowsPerPage));
  const startIndex = (currentPage - 1) * Number.parseInt(rowsPerPage);
  const endIndex = Math.min(startIndex + Number.parseInt(rowsPerPage), sortedSessions.length);
  const currentSessions = sortedSessions.slice(startIndex, endIndex);

  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (columnName) => {
    if (sortConfig.key !== columnName) return null;

    return sortConfig.direction === "ascending" ? <ChevronUp className="inline ml-1 h-4 w-4" /> : <ChevronDown className="inline ml-1 h-4 w-4" />;
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleRowsPerPageChange = (value) => {
    setRowsPerPage(value);
    setCurrentPage(1); // Reset to first page when changing rows per page
  };

  if (!classData) return <div className="container mx-auto py-8">Loading...</div>;

  return (
    <div className="container mx-auto py-8">
      <div className="mb-4">
        <Button variant="outline" onClick={() => navigate("/lecturer/request")}>
          <ChevronLeft className="w-4 h-4" />
          Back to Class List
        </Button>
      </div>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>
            {classData.className} ({classData.classCode})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Lecturer</p>
              <p className="font-medium">{classData.lecturer.fullName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Sessions</p>
              <p className="font-medium">{classData.totalSession}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Students</p>
              <p className="font-medium">{classData.classStudents.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Course</p>
              <p className="font-medium">{classData.course.courseName}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Class Sessions</h2>
      </div>

      <Table>
        <TableCaption>
          Showing {startIndex + 1}-{endIndex} of {sortedSessions.length} sessions for {classData.classCode}
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Session #</TableHead>
            <TableHead className="cursor-pointer" onClick={() => requestSort("sessionDate")}>
              Date {getSortIcon("sessionDate")}
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => requestSort("slot")}>
              Slot {getSortIcon("slot")}
            </TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Note</TableHead>
            <TableHead>Approved</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentSessions.map((session) => (
            <TableRow key={session.sessionId}>
              <TableCell className="font-medium">{session.sessionNumber}</TableCell>
              <TableCell> {format(session.sessionDate, "EEEE, dd/MM/yyyy")}</TableCell>
              <TableCell>Slot {session.slot}</TableCell>
              <TableCell>
                <SessionBadge status={session.status} />
              </TableCell>
              <TableCell>{session.type === 1 && session.request?.note || "-" }</TableCell>
              <TableCell>
                {session.request?.status === 0 ? (
                  <div className="flex  items-center gap-1">
                    <Clock size={16} className="text-yellow-500" />
                    <span>{format(session.request?.createdAt, "HH:mma, dd/MM/yyyy") || "-"}</span>
                  </div>
                ) : session.request?.status === 1 ? (
                  <div className="flex  items-center gap-1">
                    <CheckCircle size={16} className="text-green-500" />
                    <span>{format(session.request?.approvedDate, "HH:mma, dd/MM/yyyy") || "-"}</span>
                  </div>
                ) : session.request?.status === 2 ? (
                  <div className="flex  items-center gap-1">
                    <XCircle size={16} className="text-red-500" />
                    <span>{format(session.request?.approvedDate, "HH:mma, dd/MM/yyyy") || "-"}</span>
                  </div>
                ) : (
                  <span>-</span> // Trường hợp không có status hợp lệ
                )}
              </TableCell>
              <TableCell className="text-right">
                {session.type !== 1 ? (
                  <Button variant="ghost" size="icon" disabled>
                    <MailCheck className="w-5 h-5 text-yellow-700" />
                  </Button>
                ) : session.type === 1 && requestable(session) ? (
                  <Button variant="outline" size="icon" onClick={() => navigate(`/lecturer/request/${classId}/${session.sessionId}`)}>
                    <MailPlus className="w-5 h-5 text-green-500" />
                  </Button>
                ) : (
                  <Button variant="ghost" size="icon" disabled>
                    <MailX className="w-5 h-5 text-red-500" />
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Rows per page:</span>
          <Select value={rowsPerPage} onValueChange={handleRowsPerPageChange}>
            <SelectTrigger className="w-[80px]">
              <SelectValue placeholder="5" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous Page</span>
          </Button>
          <div className="flex items-center">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              // Show at most 5 page buttons
              let pageNum;
              if (totalPages <= 5) {
                // If 5 or fewer pages, show all
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                // If near the start, show first 5 pages
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                // If near the end, show last 5 pages
                pageNum = totalPages - 4 + i;
              } else {
                // Otherwise show current page and 2 on each side
                pageNum = currentPage - 2 + i;
              }

              return (
                <Button key={pageNum} variant={currentPage === pageNum ? "default" : "outline"} size="sm" className="w-8 h-8 p-0 mx-1" onClick={() => handlePageChange(pageNum)}>
                  {pageNum}
                </Button>
              );
            })}
          </div>
          <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next Page</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
