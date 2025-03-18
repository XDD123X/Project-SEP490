import { useState, useEffect } from "react";
import { Search, Edit, Trash2, ChevronDown, ChevronUp, Video, VideoOff, Eye, Link2, Link2Off } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { toast } from "sonner";
import { GetClassList } from "@/services/classService";
import { Badge } from "@/components/ui/badge";
import { getLecturerList } from "@/services/accountService";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

// Slot options
const slotOptions = [1, 2, 3, 4];
const currentYear = new Date().getFullYear();
const years = ["All", ...Array.from({ length: 7 }, (_, i) => currentYear - 3 + i)];

export default function ClassViewPage() {
  const [classList, setClassList] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState(classList);
  const [selectedYear, setSelectedYear] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [currentClass, setCurrentClass] = useState(null);

  // Add state for pagination in the SessionsPage component
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const classList = await GetClassList();
        const lecturerList = await getLecturerList();

        if (isMounted) {
          const classes = classList?.data || [];
          const lecturer = lecturerList?.data || [];

          // Sắp xếp classes nếu có dữ liệu
          const sortedClasses = classes.length > 0 ? [...classes].sort((a, b) => new Date(b.startDate) - new Date(a.startDate)) : [];
          setClassList(sortedClasses);

          // Sắp xếp lecturers nếu có dữ liệu
          const sortedLecturers = lecturer.length > 0 ? [...lecturer].sort((a, b) => b.fullName - a.fullName) : [];
          setLecturers(sortedLecturers);
        }
      } catch (error) {
        toast.error(`Failed to load data: ${error.message}`);
        console.error("Failed to load data", error);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    setFilteredClasses(classList);
  }, [classList]);

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredClasses.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredClasses.length / itemsPerPage);

  useEffect(() => {
    let result = classList;

    // Lọc theo năm đã chọn
    if (selectedYear !== "All") {
      result = result.filter((session) => {
        const startYear = new Date(session.startDate).getFullYear();
        return startYear.toString() == selectedYear;
      });
    }

    // Lọc theo từ khóa tìm kiếm
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter((session) => {
        return (
          session.classCode.toLowerCase().includes(term) ||
          session.className.toLowerCase().includes(term) ||
          session.course.courseName.toLowerCase().includes(term) ||
          session.lecturer.fullName.toLowerCase().includes(term) ||
          (session.startDate && format(new Date(session.startDate), "dd/MM/yyyy").includes(term)) ||
          (session.endDate && format(new Date(session.endDate), "dd/MM/yyyy").includes(term))
        );
      });
    }

    setFilteredClasses(result);
  }, [selectedYear, searchTerm, classList]);

  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }

    setSortConfig({ key, direction });

    const sortedData = [...filteredClasses].sort((a, b) => {
      let valueA = a[key];
      let valueB = b[key];

      if (key === "course") {
        valueA = a.course.courseName;
        valueB = b.course.courseName;
      }
      if (key === "classCode") {
        valueA = a.classCode;
        valueB = b.classCode;
      }
      if (key === "className") {
        valueA = a.className;
        valueB = b.className;
      }
      if (key === "lecturer") {
        valueA = a.lecturer.fullName;
        valueB = b.lecturer.fullName;
      }
      if (key === "session") {
        valueA = a.totalSession;
        valueB = b.totalSession;
      }

      if (key === "status") {
        valueA = a.status;
        valueB = b.status;

        const order = sortConfig.direction === "ascending" ? [1, 0, 2] : [2, 0, 1];

        return order.indexOf(valueA) - order.indexOf(valueB);
      }

      if (valueA < valueB) {
        return direction === "ascending" ? -1 : 1;
      }
      if (valueA > valueB) {
        return direction === "ascending" ? 1 : -1;
      }
      return 0;
    });

    setFilteredClasses(sortedData);
  };

  // Get sort direction icon
  const getSortDirectionIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "ascending" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
  };

  // Handle editing a session
  const handleEditClass = () => {
    const updatedClass = classList.map((classItem) => (classItem.sessionId === currentClass.classId ? currentClass : classItem));
    console.log(updatedClass);

    // setIsEditDialogOpen(false);
  };

  // Handle deleting a session
  const handleDeleteClass = (id) => {
    if (confirm("Are you sure you want to delete this session?")) {
      ("");
    }
  };

  // Handle form input changes for editing class
  const handleEditSessionChange = (field, value) => {
    setCurrentClass({
      ...currentClass,
      [field]: value,
    });
  };

  // Add this function to handle page changes
  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Class Management</h1>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="relative w-full sm:w-[300px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search classes..." className="pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>

        {/* add new dialog */}
        {/* <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="whitespace-nowrap">
              <Plus className="mr-2 h-4 w-4" /> Add New Session
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Session</DialogTitle>
              <DialogDescription>Create a new session by filling out the form below.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="className" className="text-right">
                  Class
                </Label>
                <Select value={newSession.classId} onValueChange={(value) => handleNewSessionChange("classId", value)} required>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select Class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classList.map((item) => (
                      <SelectItem key={item.classId} value={item.classId}>
                        {" "}
                        {item.classCode}{" "}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="lecturerName" className="text-right">
                  Lecturer
                </Label>
                <Select value={newSession.lecturerId} onValueChange={(value) => handleNewSessionChange("lecturerId", value)} required>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select Lecturer" />
                  </SelectTrigger>
                  <SelectContent>
                    {lecturers.map((lecturer) => (
                      <SelectItem key={lecturer.accountId} value={lecturer.accountId}>
                        {lecturer.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">
                  Date
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={newSession.date}
                  onChange={(e) => {
                    // Lấy giá trị từ input, tạo một đối tượng Date và chuyển đổi thành ISO string
                    const date = new Date(e.target.value);
                    handleNewSessionChange("sessionDate", date.toISOString()); // Chuyển thành "2025-05-13T00:00:00"
                  }}
                  className="col-span-3"
                  required
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="slot" className="text-right">
                  Slot
                </Label>
                <Select value={newSession.slot !== undefined ? newSession.slot.toString() : ""} onValueChange={(value) => handleNewSessionChange("slot", Number.parseInt(value))} required>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select Slot" />
                  </SelectTrigger>
                  <SelectContent>
                    {slotOptions.map((slot) => (
                      <SelectItem key={slot} value={slot.toString()}>
                        {slot}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="slot" className="text-right">
                  Status
                </Label>
                <Select
                  value={newSession.status?.toString() || "1"} // Đảm bảo mặc định là "1"
                  onValueChange={(value) => handleNewSessionChange("status", Number.parseInt(value))}
                  required
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status.id} value={status.id.toString()}>
                        {status.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="slot" className="text-right">
                  Description
                </Label>
                <Textarea className="col-span-3" value={newSession.description || ""} onChange={(e) => handleNewSessionChange("description", e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddSession}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog> */}
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">#</TableHead>
              <TableHead className="cursor-pointer" onClick={() => requestSort("course")}>
                <div className="flex items-center">Course {getSortDirectionIcon("course")}</div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => requestSort("classCode")}>
                <div className="flex items-center">Code {getSortDirectionIcon("classCode")}</div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => requestSort("className")}>
                <div className="flex items-center">Class Name {getSortDirectionIcon("className")}</div>
              </TableHead>

              <TableHead className="cursor-pointer" onClick={() => requestSort("lecturer")}>
                <div className="flex items-center">Lecturer {getSortDirectionIcon("lecturer")}</div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => requestSort("session")}>
                <div className="flex items-center">Session {getSortDirectionIcon("session")}</div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => requestSort("startDate")}>
                <div className="flex items-center">Start {getSortDirectionIcon("startDate")}</div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => requestSort("endDate")}>
                <div className="flex items-center">End {getSortDirectionIcon("endDate")}</div>
              </TableHead>
              <TableHead>
                <div className="flex items-center">URL</div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => requestSort("status")}>
                <div className="flex items-center">Status {getSortDirectionIcon("status")}</div>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.length > 0 ? (
              currentItems.map((classItem, index) => (
                <TableRow key={classItem.classId}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{classItem.course.courseName}</Badge>
                  </TableCell>
                  <TableCell>{classItem.classCode}</TableCell>
                  <TableCell>{classItem.className}</TableCell>

                  <TableCell> {classItem.lecturer.gender === false ? 'Ms.' : 'Mr.'} {classItem.lecturer?.fullName ?? "-"}</TableCell>
                  <TableCell>{classItem.totalSession}</TableCell>
                  <TableCell>{classItem.startDate ? format(new Date(classItem.startDate), "dd/MM/yyyy") : "-"}</TableCell>
                  <TableCell>{classItem.endDate ? format(new Date(classItem.endDate), "dd/MM/yyyy") : "-"}</TableCell>
                  <TableCell>{classItem.classUrl ? <Link2 className="text-green-500 w-5" /> : <Link2Off className="text-red-500 w-5" />}</TableCell>
                  <TableCell>
                    <Badge variant={classItem.status === 0 ? "outline" : classItem.status === 1 ? "info" : "success"}>{classItem.status === 0 ? "Upcoming" : classItem.status === 1 ? "Studying" : "Finished"}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link target="_blank" to={`/officer/class/detail?classId=${classItem.classId}`}>
                        <Button variant="outline" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link target="_blank" to={`/officer/class/edit?classId=${classItem.classId}`}>
                        <Button variant="outline" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button variant="destructive" size="icon" onClick={() => handleDeleteClass(classItem.classId)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={11} className="text-center py-6">
                  No classes found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-4">
        {/* Rows per page (Align Left) */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Rows per page:</span>
          <Select
            value={itemsPerPage.toString()}
            onValueChange={(value) => {
              setItemsPerPage(Number.parseInt(value));
              setCurrentPage(1); // Reset to first page when changing items per page
            }}
          >
            <SelectTrigger className="w-[70px]">
              <SelectValue placeholder="5" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">
            Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredClasses.length)} of {filteredClasses.length}
          </span>
        </div>

        {/* Pagination (Align Right) */}
        <div className="flex items-center gap-2">
          <Pagination>
            <PaginationContent className="flex">
              <PaginationItem>
                <PaginationPrevious onClick={() => paginate(currentPage - 1)} className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"} />
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => {
                // Show first page, last page, current page, and pages around current page
                if (number === 1 || number === totalPages || (number >= currentPage - 1 && number <= currentPage + 1)) {
                  return (
                    <PaginationItem key={number}>
                      <PaginationLink className="cursor-pointer" onClick={() => paginate(number)} isActive={currentPage === number}>
                        {number}
                      </PaginationLink>
                    </PaginationItem>
                  );
                }

                // Show ellipsis for gaps
                if (number === 2 && currentPage > 3) {
                  return (
                    <PaginationItem key="ellipsis-start">
                      <PaginationEllipsis />
                    </PaginationItem>
                  );
                }

                if (number === totalPages - 1 && currentPage < totalPages - 2) {
                  return (
                    <PaginationItem key="ellipsis-end">
                      <PaginationEllipsis />
                    </PaginationItem>
                  );
                }

                return null;
              })}

              <PaginationItem>
                <PaginationNext onClick={() => paginate(currentPage + 1)} className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  );
}
