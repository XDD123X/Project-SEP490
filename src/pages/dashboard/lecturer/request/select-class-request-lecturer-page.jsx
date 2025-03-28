import { useState, useEffect } from "react";
import { format, isPast, isSameDay, isToday, parseISO } from "date-fns";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, MailPlus, MailX, MailWarning } from "lucide-react";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate, useParams } from "react-router-dom";
import { GetClassById } from "@/services/classService";
import { getSessionsByClassId } from "@/services/sessionService";
import { toast } from "sonner";
import { SessionBadge } from "@/components/BadgeComponent";

export default function ViewRequestBySessionLecturerPage() {
  const navigate = useNavigate();
  const { classId } = useParams();
  const [classData, setClassData] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "ascending" });
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState("5");

  useEffect(() => {
    if (classId === null || classId.trim === "") {
      navigate("/404");
    }
    const fetchData = async () => {
      try {
        const responseClass = await GetClassById(classId);
        console.log(responseClass);

        if (responseClass.status === 200) {
          setClassData(responseClass.data);
          const responseSession = await getSessionsByClassId(responseClass.data.classId);
          setSessions(responseSession.data);
          console.log(responseSession);
        }
      } catch (error) {
        toast.error("Failed to fetch Session By Class Id");
      }
    };
    fetchData();
  }, [classId, navigate]);

  const requestable = (session) => {
    return session.type === 1 && session.status !== 3 && !isPast(session.sessionDate) && !isToday(session.sessionDate);
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
            <TableHead>Request</TableHead>
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
              <TableCell>
                {session.type === 1 ? "-" : 'Submitted'}
              </TableCell>
              <TableCell className="text-right">
                {requestable(session) ? (
                  <Button variant="outline" size="icon" onClick={() => navigate(`/lecturer/request/${classId}/${session.sessionId}`)}>
                    <MailPlus className="w-4 h-4 text-green-500" />
                  </Button>
                ) : (
                  <Button variant="outline" size="icon" disabled>
                    <MailX className="w-4 h-4 text-red-500" />
                  </Button>
                )}
                {session.type !== 1 && (
                  <Button variant="outline" size="icon" disabled>
                    <MailWarning className="w-4 h-4 text-yellow-600" />
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
