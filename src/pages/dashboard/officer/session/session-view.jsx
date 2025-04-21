import { useState, useEffect } from "react";
import { Search, Plus, Edit, Trash2, ChevronDown, ChevronUp, Video, VideoOff, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { toast } from "sonner";
import { deleteSession, getAllSession } from "@/services/sessionService";
import { GetClassList } from "@/services/classService";
import { Badge } from "@/components/ui/badge";
import { getLecturerList } from "@/services/accountService";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { SessionBadge } from "@/components/BadgeComponent";
import { Link } from "react-router-dom";

// Slot options
const slotOptions = [1, 2, 3, 4];
const statusOptions = [
  { id: 1, name: "Not yet" },
  { id: 2, name: "Finished" },
  { id: 3, name: "Cancelled" },
];

export default function SessionViewPage() {
  const [sessions, setSessions] = useState([]);
  const [classes, setClasses] = useState([]);
  const [classList, setClassList] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState(sessions);
  const [selectedClass, setSelectedClass] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteId, setDeleteId] = useState();
  //errors
  const [errors, setErrors] = useState({
    classId: false,
    lecturerId: false,
    date: false,
    slot: false,
    status: false,
  });

  // Add state for pagination in the SessionsPage component
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const handleDeleteSessionDialog = (sessionId) => {
    setOpenDelete(true);
    setDeleteId(sessionId);
  };

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const sessionList = await getAllSession();
        const classList = await GetClassList();
        const lecturerList = await getLecturerList();

        if (isMounted) {
          // Kiểm tra nếu API trả về null hoặc undefined
          const sessions = sessionList?.data || [];
          const classes = classList?.data || [];
          const lecturers = lecturerList?.data || [];

          // Sắp xếp sessions nếu có dữ liệu
          const sortedSessions = sessions.length > 0 ? [...sessions].sort((a, b) => new Date(a.sessionDate) - new Date(b.sessionDate)) : [];

          setSessions(sortedSessions);

          // Tạo danh sách classCodes (bao gồm "All" nếu có dữ liệu)
          const classCodes = classes.length > 0 ? ["All", ...classes.map((cls) => cls.classCode)] : ["All"];

          setClassList(classes);
          setClasses(classCodes);
          setLecturers(lecturers);
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
    setFilteredSessions(sessions);
  }, [sessions]);

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSessions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredSessions.length / itemsPerPage);

  // New session form state
  const [newSession, setNewSession] = useState({
    classId: "",
    lecturerId: "",
    sessionDate: "",
    slot: 1,
    description: "",
    sessionRecord: null,
    status: 1,
  });

  // Filter sessions based on selected class and search term
  useEffect(() => {
    let result = sessions;

    // Filter by class if not "All"
    if (selectedClass !== "All") {
      result = result.filter((session) => session.class.classCode === selectedClass);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter((session) => {
        const formattedDate = format(new Date(session.sessionDate), "EEEE");
        return session.class.classCode.toLowerCase().includes(term) || session.lecturer.fullName.toLowerCase().includes(term) || session.sessionDate.includes(term) || session.slot.toString().includes(term) || formattedDate.toLowerCase().includes(term);
      });
    }

    setFilteredSessions(result);
  }, [sessions, selectedClass, searchTerm]);

  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }

    setSortConfig({ key, direction });

    const sortedData = [...filteredSessions].sort((a, b) => {
      let valueA = a[key];
      let valueB = b[key];

      if (key === "date") {
        valueA = new Date(a.sessionDate);
        valueB = new Date(b.sessionDate);
      }
      if (key === "slot") {
        valueA = Number(a.slot);
        valueB = Number(b.slot);
      }
      if (key === "day") {
        valueA = new Date(a.sessionDate).getDay();
        valueB = new Date(b.sessionDate).getDay();
      }
      if (key === "lecturerName") {
        valueA = a.lecturer.fullName;
        valueB = b.lecturer.fullName;
      }
      if (key === "className") {
        valueA = a.class.classCode;
        valueB = b.class.classCode;
      }
      if (key === "recordDate") {
        valueA = a.sessionRecord;
        valueB = b.sessionRecord;

        if (valueA === null && valueB !== null) return sortConfig.direction === "ascending" ? -1 : 1;
        if (valueA !== null && valueB === null) return sortConfig.direction === "ascending" ? 1 : -1;

        return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
      }

      if (key === "status") {
        valueA = a.status;
        valueB = b.status;

        const order = sortConfig.direction === "ascending" ? [2, 1, 3] : [3, 1, 2];

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

    setFilteredSessions(sortedData);
  };

  // Get sort direction icon
  const getSortDirectionIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "ascending" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
  };

  // Handle adding a new session
  const handleAddSession = () => {
    if (!newSession.classId || !newSession.lecturerId || !newSession.sessionDate || !newSession.slot || !newSession.status) {
      toast.error("Please fill out all required fields.");
      return;
    }
    console.log(newSession);
    setIsAddDialogOpen(false);

    // Reset form
    // setNewSession({
    //   classId: "",
    //   lecturerId: "",
    //   sessionDate: new Date(),
    //   slot: 0,
    //   description: "",
    //   sessionRecord: new Date(),
    //   status: 0,
    // });
  };

  // Handle editing a session
  const handleEditSession = () => {
    const updatedSessions = sessions.map((session) => (session.sessionId === currentSession.sessionId ? currentSession : session));
    console.log(updatedSessions);

    // setIsEditDialogOpen(false);
  };

  // Handle deleting a session
  const handleDeleteSession = async () => {
    try {
      setIsDeleting(true);
      await deleteSession(deleteId);
      toast.success("The session has been successfully deleted.");
      setOpenDelete(false);
      fetchData();
    } catch (error) {
      console.error("Failed to delete session:", error);
      toast.error("Failed to delete the session. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle form input changes for new session
  const handleNewSessionChange = (field, value) => {
    setNewSession({
      ...newSession,
      [field]: value,
    });
  };

  // Handle form input changes for editing session
  const handleEditSessionChange = (field, value) => {
    setCurrentSession({
      ...currentSession,
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
      <h1 className="text-3xl font-bold mb-6">Session List</h1>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Class" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="relative w-full sm:w-[300px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search sessions..." className="pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>

        {/* add new dialog */}
        <Link to={`/officer/session/add`}>
          <Button className="whitespace-nowrap">
            <Plus className="mr-2 h-4 w-4" /> Add New Session
          </Button>
        </Link>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">#</TableHead>

              <TableHead className="cursor-pointer" onClick={() => requestSort("className")}>
                <div className="flex items-center">Class {getSortDirectionIcon("className")}</div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => requestSort("lecturerName")}>
                <div className="flex items-center">Lecturer {getSortDirectionIcon("lecturerName")}</div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => requestSort("slot")}>
                <div className="flex items-center">Slot {getSortDirectionIcon("slot")}</div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => requestSort("date")}>
                <div className="flex items-center">Date {getSortDirectionIcon("date")}</div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => requestSort("recordDate")}>
                <div className="flex items-center">Record {getSortDirectionIcon("recordDate")}</div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => requestSort("status")}>
                <div className="flex items-center">Status</div>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.length > 0 ? (
              currentItems.map((session, index) => (
                <TableRow key={session.sessionId}>
                  <TableCell>{index + 1}</TableCell>

                  <TableCell>{session.class.classCode}</TableCell>
                  <TableCell>
                    {session.lecturer.gender === false ? "Ms." : "Mr."} {session.lecturer.fullName}
                  </TableCell>
                  <TableCell>Slot {session.slot}</TableCell>
                  <TableCell>{format(new Date(session.sessionDate), "EEEE, dd/MM/yyyy")}</TableCell>
                  <TableCell>{session.sessionRecord ? <Video className="h-4 w-4 text-green-500" /> : <VideoOff className="h-4 w-4 text-red-500" />}</TableCell>
                  <TableCell>
                    <SessionBadge status={session.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setCurrentSession(session);
                          setIsViewDialogOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setCurrentSession(session);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="icon" onClick={() => handleDeleteSessionDialog(session.sessionId)} disabled={session.status === 2}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-6">
                  No sessions found
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
            Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredSessions.length)} of {filteredSessions.length}
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

      {/* Edit Session Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Session</DialogTitle>
            <DialogDescription>Update the session details below.</DialogDescription>
          </DialogHeader>
          {currentSession && (
            <div className="grid gap-4 py-4">
              {/* Class (Disabled) */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Class</Label>
                <Input value={currentSession.class.classCode} className="col-span-3" disabled />
              </div>

              {/* Lecturer (Dropdown Select) */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Lecturer</Label>
                <Select value={currentSession.lecturerId} onValueChange={(value) => handleEditSessionChange("lecturerId", value)}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select Lecturer" />
                  </SelectTrigger>
                  <SelectContent>
                    {lecturers.map((lecturer) => (
                      <SelectItem key={lecturer.accountId} value={lecturer.accountId}>
                        {lecturer.gender === false ? "Ms." : "Mr."} {lecturer.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Date</Label>
                <Input type="date" value={currentSession.sessionDate ? currentSession.sessionDate.split("T")[0] : ""} onChange={(e) => handleEditSessionChange("sessionDate", e.target.value)} className="col-span-3" />
              </div>

              {/* Slot (Dropdown Select) */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Slot</Label>
                <Select value={currentSession.slot.toString()} onValueChange={(value) => handleEditSessionChange("slot", Number(value))}>
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

              {/* Session Record */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Session Record</Label>
                <div className="col-span-3 flex items-center gap-2">
                  {currentSession.sessionRecord ? (
                    <>
                      <Badge variant="success">Recorded</Badge>
                      <span className="text-gray-500 text-sm">({format(new Date(currentSession.sessionRecord), "dd/MM/yyyy HH:mm")})</span>
                    </>
                  ) : (
                    <Badge variant="outline">Not yet</Badge>
                  )}
                </div>
              </div>

              {/* Status (Dropdown Select) */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Status</Label>
                <Select value={currentSession.status.toString()} onValueChange={(value) => handleEditSessionChange("status", Number(value))}>
                  <SelectTrigger
                    className={cn(
                      "col-span-3",
                      currentSession.status === 1 && "font-bold bg-zinc-200 text-zinc-500",
                      currentSession.status === 2 && "font-bold bg-green-200 text-green-700",
                      currentSession.status === 3 && "font-bold bg-red-200 text-red-700"
                    )}
                  >
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Not yet</SelectItem>
                    <SelectItem value="2">Finished</SelectItem>
                    <SelectItem value="3">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Description (Textarea) */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Description</Label>
                <Textarea className="col-span-3" value={currentSession.description || ""} onChange={(e) => handleEditSessionChange("description", e.target.value)} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSession}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Diaglog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>View Session Detail</DialogTitle>
            <DialogDescription>All Detail Information Of Session Below.</DialogDescription>
          </DialogHeader>
          {currentSession && (
            <div className="grid gap-4 py-4">
              {/* Class (Disabled) */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Class</Label>
                <Input value={currentSession.class.classCode} className="col-span-3" readOnly />
              </div>

              {/* Lecturer (Dropdown Select) */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Lecturer</Label>
                <Input value={(currentSession.lecturer.gender === false ? "Ms. " : "Mr. ") + currentSession.lecturer.fullName} className="col-span-3" readOnly />
              </div>

              {/* Date */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Date</Label>
                <Input value={currentSession.sessionDate ? format(currentSession.sessionDate, "dd/MM/yyyy") : ""} className="col-span-3" readOnly />
              </div>

              {/* Slot (Dropdown Select) */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Slot</Label>
                <Input value={currentSession.slot.toString()} className="col-span-3" readOnly />
                {/* <Select value={currentSession.slot.toString()} onValueChange={(value) => handleEditSessionChange("slot", Number(value))}>
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
                </Select> */}
              </div>

              {/* Session Record */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Record</Label>
                <div className="col-span-3 flex items-center gap-2">
                  {currentSession.sessionRecord ? (
                    <>
                      <Badge variant="success">Recorded</Badge>
                      <span className="text-gray-500 text-sm">({format(new Date(currentSession.sessionRecord), "dd/MM/yyyy HH:mm")})</span>
                    </>
                  ) : (
                    <Badge variant="outline">Not yet</Badge>
                  )}
                </div>
              </div>

              {/* Status (Dropdown Select) */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Status</Label>
                <Input
                  value={currentSession.status === 1 ? "Not Yet" : currentSession.status === 2 ? "Finished" : "Cancelled"}
                  className={cn(
                    "col-span-3",
                    currentSession.status === 1 && "font-bold bg-zinc-200 text-zinc-500",
                    currentSession.status === 2 && "font-bold bg-green-200 text-green-700",
                    currentSession.status === 3 && "font-bold bg-red-200 text-red-700"
                  )}
                  readOnly
                />
                {/* <Select value={currentSession.status.toString()} onValueChange={(value) => handleEditSessionChange("status", Number(value))}>
                  <SelectTrigger
                    className={cn(
                      "col-span-3",
                      currentSession.status === 1 && "font-bold bg-zinc-200 text-zinc-500",
                      currentSession.status === 2 && "font-bold bg-green-200 text-green-700",
                      currentSession.status === 3 && "font-bold bg-red-200 text-red-700"
                    )}
                  >
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Not yet</SelectItem>
                    <SelectItem value="2">Finished</SelectItem>
                    <SelectItem value="3">Cancelled</SelectItem>
                  </SelectContent>
                </Select> */}
              </div>

              {/* Description (Textarea) */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Description</Label>
                <Textarea className="col-span-3" value={currentSession.description || ""} readOnly />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button className="w-full" onClick={() => setIsViewDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* delete diaglog */}
      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Session</DialogTitle>
            <DialogDescription>Are you sure you want to delete this session? This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDelete(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteSession} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
