import { useEffect, useState } from "react";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, ClipboardCheckIcon, Eye, Hand, MailPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { GetLecturerClassList } from "@/services/classService";
import { toast } from "sonner";

export default function ViewRequestByClassLecturerPage() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState("5");

  //fetch classes
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await GetLecturerClassList();

        if (response.status === 200) {
          setClasses(response.data);
        }
      } catch (error) {
        toast.error("Failed to fetch class data");
      }
    };
    fetchData();
  }, []);

  const filteredClasses = classes.filter((cls) => cls.className.toLowerCase().includes(searchTerm.toLowerCase()) || cls.classCode.toLowerCase().includes(searchTerm.toLowerCase()) || cls.course.courseName.toLowerCase().includes(searchTerm.toLowerCase()));

  const totalPages = Math.ceil(filteredClasses.length / Number.parseInt(rowsPerPage));
  const startIndex = (currentPage - 1) * Number.parseInt(rowsPerPage);
  const endIndex = Math.min(startIndex + Number.parseInt(rowsPerPage), filteredClasses.length);
  const currentClasses = filteredClasses.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleRowsPerPageChange = (value) => {
    setRowsPerPage(value);
    setCurrentPage(1);
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Session Change Request</h1>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <Input placeholder="Search classes..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="max-w-md" />
      </div>

      <Table>
        <TableCaption>
          Showing {startIndex + 1}-{endIndex} of {filteredClasses.length} classes
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Course</TableHead>
            <TableHead>Lecturer</TableHead>
            <TableHead>Sessions</TableHead>
            <TableHead>Students</TableHead>

            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {classes.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center">
                The Lecturer has not been assigned any classes to teach.
              </TableCell>
            </TableRow>
          )}
          {currentClasses.map((cls) => (
            <TableRow key={cls.classId}>
              <TableCell>{cls.classCode}</TableCell>
              <TableCell className="font-medium">{cls.className}</TableCell>
              <TableCell>{cls.course.courseName}</TableCell>
              <TableCell>{cls.lecturer.fullName}</TableCell>
              <TableCell>{cls.totalSession}</TableCell>
              <TableCell>{cls.classStudents.length}</TableCell>

              <TableCell className="text-right space-x-2">
                {/* <Button variant="outline" size="icon" onClick={() => navigate(`/lecturer/class/detail/${cls.classId}`)}>
                  <Eye className="w-4 h-4" />
                </Button> */}
                <Button variant="outline" size="icon" onClick={() => navigate(`/lecturer/request/${cls.classId}`)}>
                  <MailPlus className="w-4 h-4 text-green-500" />
                </Button>
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
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button key={page} variant={currentPage === page ? "default" : "outline"} size="sm" className="w-8 h-8 p-0 mx-1" onClick={() => handlePageChange(page)}>
                {page}
              </Button>
            ))}
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
