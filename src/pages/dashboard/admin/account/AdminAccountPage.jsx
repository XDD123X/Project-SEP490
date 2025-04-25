import { useState, useEffect } from "react";
import { Search, Edit, Trash2, Eye, ChevronUp, ChevronDown, Upload, Download, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { format } from "date-fns";
import { toast } from "sonner";
import { deleteAccountById, getAccounts, getOfficerList, importOfficerList } from "@/services/accountService";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { Spinner } from "@/components/ui/spinner";
import { AccountBadge } from "@/components/BadgeComponent";
import { ImportAccountsOfficerDialog } from "../../officer/account/components/add-student-import-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function AdminAccountPage() {
  const [officers, setOfficers] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [filteredLecturers, setFilteredLecturers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isOpenDelete, setIsOpenDelete] = useState(false);
  const [deleteId, setDeleteId] = useState();

  //dialog
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

  // Add state for pagination in the SessionsPage component
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  //fetch Data
  const fetchData = async () => {
    try {
      const officerList = await getOfficerList();
      const accountList = await getAccounts();
      if (officerList.status === 200 && accountList.status === 200) {
        const lecturers = officerList?.data || [];
        const sortedLecturers = lecturers.length > 0 ? [...lecturers].sort((a, b) => b.fullName.localeCompare(a.fullName)) : [];
        setOfficers(sortedLecturers);
        setAccounts(accountList.data);
      }
    } catch (error) {
      toast.error(`Failed to load data: ${error.message}`);
      console.error("Failed to load data", error);
    }
  };

  //fetch Data
  useEffect(() => {
    fetchData();
  }, []);

  //set filter list
  useEffect(() => {
    setFilteredLecturers(officers);
  }, [officers]);

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredLecturers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredLecturers.length / itemsPerPage);

  //filter
  useEffect(() => {
    let result = officers;

    // Lọc theo từ khóa tìm kiếm
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter((student) => {
        return student.email.toLowerCase().includes(term) || student.fullName.toLowerCase().includes(term) || student.phoneNumber.toLowerCase().includes(term) || (student.dob && format(new Date(student.dob), "dd/MM/yyyy").includes(term));
      });
    }

    setFilteredLecturers(result);
  }, [searchTerm, officers]);

  //sort
  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }

    setSortConfig({ key, direction });

    const sortedData = [...filteredLecturers].sort((a, b) => {
      let valueA = a[key];
      let valueB = b[key];

      if (key === "fullName") {
        return sortConfig.direction === "ascending" ? b.fullName.localeCompare(a.fullName) : a.fullName.localeCompare(b.fullName);
      }
      if (key === "email") {
        return sortConfig.direction === "ascending" ? b.email.localeCompare(a.email, undefined, { numeric: true }) : a.email.localeCompare(b.email, undefined, { numeric: true });
      }
      if (key === "dob") {
        valueA = a.dob;
        valueB = b.dob;
      }
      if (key === "gender") {
        valueA = a.gender;
        valueB = b.gender;
      }

      if (key === "status") {
        valueA = a.status;
        valueB = b.status;

        const order = sortConfig.direction === "ascending" ? [0, 1, 2, 3] : [3, 2, 1, 0];

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

    setFilteredLecturers(sortedData);
  };

  // Get sort direction icon
  const getSortDirectionIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "ascending" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
  };

  // Handle deleting a student
  const handleDeleteOfficer = async () => {
    try {
      setIsDeleting(true);

      const response = await deleteAccountById(deleteId);

      if (response?.status === 200) {
        setOfficers((prev) => prev.filter((officer) => officer.accountId !== deleteId));
        toast.success("Delete Officer Successfully");
        setIsOpenDelete(false);
      } else {
        toast.error("Failed to delete officer");
      }
    } catch (error) {
      console.error("Failed to delete officer:", error);
      toast.error("Failed to delete officer");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenDeleteDialog = (accountId) => {
    setDeleteId(accountId);
    setIsOpenDelete(true);
  };

  // Add this function to handle page changes
  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Handle export class students
  const handleExport = () => {
    // Create CSV content
    const headers = ["Email", "Name", "Phone Number", "Date of Birth", "Gender", "Created Date"];
    const rows = officers.map((student) => [student.email, student.fullName, student.phoneNumber, format(student.dob, "dd/MM/yyyy"), student.gender ? "Male" : "Female", format(student.createdAt, "dd/MM/yyyy")]);

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

    // Create and download the file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    const now = format(new Date(), "dd-MM-yyyy_HH-mm");
    link.setAttribute("download", `export_lecturers_${now}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle download template
  const handleDownloadTemplate = () => {
    const templateHeaders = ["Email", "Name", "Phone Number", "Date of Birth", "Gender"];
    const templateRow = ["john.doe@example.com", "John Doe", "0123456789", "03-06-2002", "Male"];

    const csvContent = [templateHeaders.join(","), templateRow.join(",")].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "lecturer_import_template.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Function to handle imported students
  const handleImportOfficers = async (importedOfficers) => {
    if (!officers) return;
    setIsLoading(true);

    // Tạo Set chứa danh sách email của sinh viên đã tồn tại
    const existingOfficerEmails = new Set(officers.map((officer) => officer.email));

    // Lọc ra các sinh viên có email chưa tồn tại
    const uniqueOfficers = importedOfficers.filter((officer) => !existingOfficerEmails.has(officer.email));

    // Tạo danh sách sinh viên mới để thêm vào
    const newOfficers = uniqueOfficers.map((officer) => ({
      accountId: crypto.randomUUID(),
      email: officer.email,
      fullName: officer.fullName,
      phoneNumber: officer.phoneNumber,
      dob: officer.dob ? new Date(officer.dob).toISOString().split("T")[0] : null,
      gender: officer.gender,
      status: 3,
      createdAt: new Date().toISOString(),
    }));

    // Cập nhật danh sách students
    // const updatedStudents = [...students, ...newStudents];

    try {
      // Gọi API import danh sách sinh viên
      const response = await importOfficerList(newOfficers);

      if (response.status === 200) {
        toast.success(`Added ${uniqueOfficers.length} officers successfully`);

        // Cập nhật danh sách students nếu API thành công
        // setStudents((prevStudents) => [...prevStudents, ...newStudents]);
        fetchData();
        setIsLoading(false);
      } else {
        toast.error(response.message || "Failed to import officer");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Import error:", error);
      toast.error("An error occurred while importing officers");
      setIsLoading(false);
    }

    // Cập nhật state
    // setStudents(updatedStudents);
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Officer Management</h1>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto flex-grow">
          <div className="relative w-full sm:w-[300px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search officer..." className="pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="flex items-center gap-2 w-full sm:w-auto" onClick={() => setIsImportDialogOpen(true)}>
            <Upload className="h-4 w-4" />
            Import Officers
          </Button>

          <Button variant="outline" className="flex items-center gap-2 w-full sm:w-auto" onClick={handleExport}>
            <Download className="h-4 w-4" />
            Export Officers
          </Button>

          <Button variant="outline" className="flex items-center gap-2 w-full sm:w-auto" onClick={handleDownloadTemplate}>
            <FileDown className="h-4 w-4" />
            Download Template
          </Button>
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">#</TableHead>
              <TableHead>
                <div className="flex items-center">Avatar</div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => requestSort("email")}>
                <div className="flex items-center">Email {getSortDirectionIcon("email")}</div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => requestSort("fullName")}>
                <div className="flex items-center">Name {getSortDirectionIcon("fullName")}</div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => requestSort("phoneNumber")}>
                <div className="flex items-center">Phone {getSortDirectionIcon("phoneNumber")}</div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => requestSort("gender")}>
                <div className="flex items-center">Gender {getSortDirectionIcon("gender")}</div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => requestSort("createdAt")}>
                <div className="flex items-center">Join Date {getSortDirectionIcon("createdAt")}</div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => requestSort("status")}>
                <div className="flex items-center">Status {getSortDirectionIcon("status")}</div>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.length > 0 ? (
              currentItems.map((account, index) => (
                <TableRow key={account.accountId}>
                  <TableCell className="text-center font-medium">{index + 1}</TableCell>
                  <TableCell>
                    <Avatar>
                      <AvatarImage src={account.imgUrl} alt={account.fullName} />
                      <AvatarFallback>
                        {account.fullName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .substring(0, 2)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">{account.email}</TableCell>
                  <TableCell>{account.fullName}</TableCell>
                  <TableCell>{account.phoneNumber}</TableCell>
                  <TableCell>{account.gender ? "Male" : "Female"}</TableCell>
                  <TableCell>{format(new Date(account.createdAt), "dd/MM/yyyy")}</TableCell>
                  <TableCell>
                    <AccountBadge status={account.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link to={`/account/${account.accountId}`}>
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link to={`/administrator/account/edit/${account.accountId}`}>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button disabled={account.status != 0} variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleOpenDeleteDialog(account.accountId)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={11} className="text-center py-8">
                  No officers found
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
            Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredLecturers.length)} of {filteredLecturers.length}
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

      <ImportAccountsOfficerDialog isOpen={isImportDialogOpen} onClose={() => setIsImportDialogOpen(false)} onImport={handleImportOfficers} accountsData={accounts} type={"Officer"} />
      {/* Loading Screen   */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm transition-all">
          <div className="flex flex-col items-center gap-2">
            <Spinner />
            <h2 className="text-lg font-medium">Adding Officer...</h2>
          </div>
        </div>
      )}

      {/* delete dialog */}
      <Dialog open={isOpenDelete} onOpenChange={setIsOpenDelete}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Officer</DialogTitle>
            <DialogDescription>Are you sure you want to delete this officer? This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-row justify-end gap-2 sm:justify-end">
            <Button type="button" variant="outline" onClick={() => setIsOpenDelete(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={handleDeleteOfficer} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
