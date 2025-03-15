import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, CreditCard, Download, Edit, Eye, FileUp, MoreHorizontal, Plus, Search, Trash2, User } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

// Mock data for demonstration
const mockUsers = [
  {
    id: 1,
    email: "john.doe@example.com",
    fullName: "John Doe",
    role: "Admin",
    fullTime: true,
    phone: "+1 (555) 123-4567",
    dob: "1985-06-15",
    avatar: "https://ui.shadcn.com/avatars/shadcn.jpg",
    status: "Active",
    createdAt: "2023-01-15T08:30:00Z",
    updatedAt: "2023-05-20T14:45:00Z",
  },
  {
    id: 2,
    email: "jane.smith@example.com",
    fullName: "Jane Smith",
    role: "Manager",
    fullTime: true,
    phone: "+1 (555) 987-6543",
    dob: "1990-03-22",
    avatar: "https://ui.shadcn.com/avatars/shadcn.jpg",
    status: "Active",
    createdAt: "2023-02-10T10:15:00Z",
    updatedAt: "2023-06-05T09:30:00Z",
  },
  {
    id: 3,
    email: "robert.johnson@example.com",
    fullName: "Robert Johnson",
    role: "Developer",
    fullTime: false,
    phone: "+1 (555) 456-7890",
    dob: "1992-11-08",
    avatar: "https://ui.shadcn.com/avatars/shadcn.jpg",
    status: "Inactive",
    createdAt: "2023-03-05T14:20:00Z",
    updatedAt: "2023-04-18T11:10:00Z",
  },
  {
    id: 4,
    email: "emily.wilson@example.com",
    fullName: "Emily Wilson",
    role: "Designer",
    fullTime: true,
    phone: "+1 (555) 234-5678",
    dob: "1988-09-17",
    avatar: "https://ui.shadcn.com/avatars/shadcn.jpg",
    status: "Active",
    createdAt: "2023-02-28T09:45:00Z",
    updatedAt: "2023-05-12T16:30:00Z",
  },
  {
    id: 5,
    email: "michael.brown@example.com",
    fullName: "Michael Brown",
    role: "Developer",
    fullTime: false,
    phone: "+1 (555) 876-5432",
    dob: "1991-07-30",
    avatar: "https://ui.shadcn.com/avatars/shadcn.jpg",
    status: "Active",
    createdAt: "2023-01-20T11:25:00Z",
    updatedAt: "2023-06-10T13:15:00Z",
  },
  {
    id: 6,
    email: "sarah.davis@example.com",
    fullName: "Sarah Davis",
    role: "HR Manager",
    fullTime: true,
    phone: "+1 (555) 345-6789",
    dob: "1986-04-12",
    avatar: "https://ui.shadcn.com/avatars/shadcn.jpg",
    status: "Active",
    createdAt: "2023-03-15T08:50:00Z",
    updatedAt: "2023-05-25T10:20:00Z",
  },
  {
    id: 7,
    email: "david.miller@example.com",
    fullName: "David Miller",
    role: "QA Engineer",
    fullTime: true,
    phone: "+1 (555) 654-3210",
    dob: "1993-12-05",
    avatar: "https://ui.shadcn.com/avatars/shadcn.jpg",
    status: "Inactive",
    createdAt: "2023-02-05T13:40:00Z",
    updatedAt: "2023-04-30T15:55:00Z",
  },
  {
    id: 8,
    email: "jennifer.taylor@example.com",
    fullName: "Jennifer Taylor",
    role: "Product Manager",
    fullTime: true,
    phone: "+1 (555) 789-0123",
    dob: "1987-08-25",
    avatar: "https://ui.shadcn.com/avatars/shadcn.jpg",
    status: "Active",
    createdAt: "2023-01-30T09:10:00Z",
    updatedAt: "2023-06-15T11:45:00Z",
  },
  {
    id: 9,
    email: "thomas.anderson@example.com",
    fullName: "Thomas Anderson",
    role: "Developer",
    fullTime: false,
    phone: "+1 (555) 321-0987",
    dob: "1994-02-18",
    avatar: "https://ui.shadcn.com/avatars/shadcn.jpg",
    status: "Active",
    createdAt: "2023-03-10T10:30:00Z",
    updatedAt: "2023-05-05T14:20:00Z",
  },
  {
    id: 10,
    email: "lisa.white@example.com",
    fullName: "Lisa White",
    role: "Designer",
    fullTime: true,
    phone: "+1 (555) 567-8901",
    dob: "1989-10-10",
    avatar: "https://ui.shadcn.com/avatars/shadcn.jpg",
    status: "Active",
    createdAt: "2023-02-20T15:15:00Z",
    updatedAt: "2023-04-25T12:35:00Z",
  },
  {
    id: 11,
    email: "james.wilson@example.com",
    fullName: "James Wilson",
    role: "Sales Manager",
    fullTime: true,
    phone: "+1 (555) 890-1234",
    dob: "1984-05-28",
    avatar: "https://ui.shadcn.com/avatars/shadcn.jpg",
    status: "Active",
    createdAt: "2023-01-25T12:50:00Z",
    updatedAt: "2023-06-20T09:25:00Z",
  },
  {
    id: 12,
    email: "olivia.martin@example.com",
    fullName: "Olivia Martin",
    role: "Marketing Specialist",
    fullTime: false,
    phone: "+1 (555) 432-1098",
    dob: "1995-01-15",
    avatar: "https://ui.shadcn.com/avatars/shadcn.jpg",
    status: "Inactive",
    createdAt: "2023-03-20T11:05:00Z",
    updatedAt: "2023-05-15T16:40:00Z",
  },
];

export default function AccountManagement() {
  const [users, setUsers] = useState(mockUsers);
  const [filteredUsers, setFilteredUsers] = useState(mockUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState("id");
  const [sortDirection, setSortDirection] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [visibleColumns, setVisibleColumns] = useState({
    email: true,
    fullName: true,
    role: true,
    fullTime: true,
    phone: true,
    dob: true,
    avatar: true,
    status: true,
    createdAt: false,
    updatedAt: false,
  });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Filter and sort users when search term or sort parameters change
  useEffect(() => {
    let result = [...users];

    // Apply search filter
    if (searchTerm) {
      result = result.filter(
        (user) => user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase()) || user.role.toLowerCase().includes(searchTerm.toLowerCase()) || user.phone.includes(searchTerm)
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];

      if (typeof aValue === "string") {
        return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      } else {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      }
    });

    setFilteredUsers(result);
    setCurrentPage(1); // Reset to first page when filtering
  }, [users, searchTerm, sortColumn, sortDirection]);

  // Handle column sort
  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // Handle search input change
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Toggle column visibility
  const toggleColumnVisibility = (column) => {
    setVisibleColumns({
      ...visibleColumns,
      [column]: !visibleColumns[column],
    });
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + rowsPerPage);

  // Handle edit user
  const handleEditUser = (user) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  // Handle delete user
  const handleDeleteUser = (user) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  // Confirm delete user
  const confirmDeleteUser = () => {
    if (selectedUser) {
      setUsers(users.filter((user) => user.id !== selectedUser.id));
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
    }
  };

  // Export to Excel (mock function)
  const exportToExcel = () => {
    alert("Export to Excel functionality would be implemented here");
    // In a real implementation, you would use a library like xlsx
    // to convert the data and trigger a download
  };

  // Import from Excel (mock function)
  const importFromExcel = () => {
    alert("Import from Excel functionality would be implemented here");
    // In a real implementation, you would use a file input and a library
    // to parse the Excel file
  };

  // Format date for display
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch (error) {
      return dateString;
    }
  };

  // Format datetime for display
  const formatDateTime = (dateString) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy HH:mm");
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Account Management</h1>
        <div className="flex gap-2">
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Account
          </Button>
          <Button variant="outline" onClick={exportToExcel}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" onClick={importFromExcel}>
            <FileUp className="mr-2 h-4 w-4" />
            Import
          </Button>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search accounts..." className="pl-8" value={searchTerm} onChange={handleSearch} />
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">
              <Eye className="mr-2 h-4 w-4" />
              View Columns
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56">
            <div className="space-y-2">
              <h4 className="font-medium">Toggle Columns</h4>
              <div className="grid gap-2">
                {Object.keys(visibleColumns).map((column) => (
                  <div key={column} className="flex items-center space-x-2">
                    <Checkbox id={`column-${column}`} checked={visibleColumns[column]} onCheckedChange={() => toggleColumnVisibility(column)} />
                    <Label htmlFor={`column-${column}`} className="capitalize">
                      {column === "dob" ? "Date of Birth" : column === "fullTime" ? "Full Time" : column === "createdAt" ? "Created At" : column === "updatedAt" ? "Updated At" : column}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">#</TableHead>

              {visibleColumns.avatar && <TableHead>Avatar</TableHead>}
              {visibleColumns.fullName && (
                <TableHead className="cursor-pointer" onClick={() => handleSort("fullName")}>
                  Full Name
                  {sortColumn === "fullName" && (sortDirection === "asc" ? <ChevronUp className="inline ml-1 h-4 w-4" /> : <ChevronDown className="inline ml-1 h-4 w-4" />)}
                </TableHead>
              )}
              {visibleColumns.email && (
                <TableHead className="cursor-pointer" onClick={() => handleSort("email")}>
                  Email
                  {sortColumn === "email" && (sortDirection === "asc" ? <ChevronUp className="inline ml-1 h-4 w-4" /> : <ChevronDown className="inline ml-1 h-4 w-4" />)}
                </TableHead>
              )}
              {visibleColumns.role && (
                <TableHead className="cursor-pointer" onClick={() => handleSort("role")}>
                  Role
                  {sortColumn === "role" && (sortDirection === "asc" ? <ChevronUp className="inline ml-1 h-4 w-4" /> : <ChevronDown className="inline ml-1 h-4 w-4" />)}
                </TableHead>
              )}
              {visibleColumns.fullTime && (
                <TableHead className="cursor-pointer" onClick={() => handleSort("fullTime")}>
                  Full Time
                  {sortColumn === "fullTime" && (sortDirection === "asc" ? <ChevronUp className="inline ml-1 h-4 w-4" /> : <ChevronDown className="inline ml-1 h-4 w-4" />)}
                </TableHead>
              )}
              {visibleColumns.phone && (
                <TableHead className="cursor-pointer" onClick={() => handleSort("phone")}>
                  Phone
                  {sortColumn === "phone" && (sortDirection === "asc" ? <ChevronUp className="inline ml-1 h-4 w-4" /> : <ChevronDown className="inline ml-1 h-4 w-4" />)}
                </TableHead>
              )}
              {visibleColumns.dob && (
                <TableHead className="cursor-pointer" onClick={() => handleSort("dob")}>
                  Date of Birth
                  {sortColumn === "dob" && (sortDirection === "asc" ? <ChevronUp className="inline ml-1 h-4 w-4" /> : <ChevronDown className="inline ml-1 h-4 w-4" />)}
                </TableHead>
              )}
              {visibleColumns.status && (
                <TableHead className="cursor-pointer" onClick={() => handleSort("status")}>
                  Status
                  {sortColumn === "status" && (sortDirection === "asc" ? <ChevronUp className="inline ml-1 h-4 w-4" /> : <ChevronDown className="inline ml-1 h-4 w-4" />)}
                </TableHead>
              )}
              {visibleColumns.createdAt && (
                <TableHead className="cursor-pointer" onClick={() => handleSort("createdAt")}>
                  Created At
                  {sortColumn === "createdAt" && (sortDirection === "asc" ? <ChevronUp className="inline ml-1 h-4 w-4" /> : <ChevronDown className="inline ml-1 h-4 w-4" />)}
                </TableHead>
              )}
              {visibleColumns.updatedAt && (
                <TableHead className="cursor-pointer" onClick={() => handleSort("updatedAt")}>
                  Updated At
                  {sortColumn === "updatedAt" && (sortDirection === "asc" ? <ChevronUp className="inline ml-1 h-4 w-4" /> : <ChevronDown className="inline ml-1 h-4 w-4" />)}
                </TableHead>
              )}
              <TableHead className="w-16">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedUsers.length > 0 ? (
              paginatedUsers.map((user, index) => (
                <TableRow key={user.id}>
                  <TableCell className="">{index + 1}</TableCell>
                  {visibleColumns.avatar && (
                    <TableCell>
                      <img src={user.avatar || "/placeholder.svg"} alt={`${user.fullName}'s avatar`} width={40} height={40} className="rounded-full" />
                    </TableCell>
                  )}
                  {visibleColumns.fullName && <TableCell className="font-medium">{user.fullName}</TableCell>}
                  {visibleColumns.email && <TableCell>{user.email}</TableCell>}
                  {visibleColumns.role && <TableCell>{user.role}</TableCell>}
                  {visibleColumns.fullTime && <TableCell>{user.fullTime ? "Yes" : "No"}</TableCell>}
                  {visibleColumns.phone && <TableCell>{user.phone}</TableCell>}
                  {visibleColumns.dob && <TableCell>{formatDate(user.dob)}</TableCell>}
                  {visibleColumns.status && (
                    <TableCell>
                      <Badge variant={user.status === "Active" ? "success" : "destructive"}>{user.status}</Badge>
                    </TableCell>
                  )}
                  {visibleColumns.createdAt && <TableCell>{formatDateTime(user.createdAt)}</TableCell>}
                  {visibleColumns.updatedAt && <TableCell>{formatDateTime(user.updatedAt)}</TableCell>}
                  <TableCell className="flex flex-row gap-2">
                    <Button variant="outline" size="icon" onClick={() => handleEditUser(user)}>
                      <Edit />
                    </Button>
                    <Button variant="destructive" size="icon" onClick={() => handleDeleteUser(user)}>
                      <Trash2 />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={Object.values(visibleColumns).filter(Boolean).length + 1} className="text-center py-6">
                  No accounts found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1}-{Math.min(startIndex + rowsPerPage, filteredUsers.length)} of {filteredUsers.length} accounts
          </p>
          <Select value={rowsPerPage.toString()} onValueChange={(value) => setRowsPerPage(Number(value))}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Rows" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 rows</SelectItem>
              <SelectItem value="10">10 rows</SelectItem>
              <SelectItem value="20">15 rows</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
            First
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
            Previous
          </Button>
          <span className="text-sm">
            Page {currentPage} of {totalPages || 1}
          </span>
          <Button variant="outline" size="sm" onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages || totalPages === 0}>
            Next
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages || totalPages === 0}>
            Last
          </Button>
        </div>
      </div>

      {/* Add Account Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Account</DialogTitle>
            <DialogDescription>Create a new user account with the form below.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-name" className="text-right">
                Name
              </Label>
              <Input id="new-name" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-email" className="text-right">
                Email
              </Label>
              <Input id="new-email" type="email" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-role" className="text-right">
                Role
              </Label>
              <Input id="new-role" className="col-span-3" />
            </div>
            {/* Additional fields would be added here */}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsAddModalOpen(false)}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Account Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Account</DialogTitle>
            <DialogDescription>Update the user account information.</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  Name
                </Label>
                <Input id="edit-name" defaultValue={selectedUser.fullName} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-email" className="text-right">
                  Email
                </Label>
                <Input id="edit-email" type="email" defaultValue={selectedUser.email} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-role" className="text-right">
                  Role
                </Label>
                <Input id="edit-role" defaultValue={selectedUser.role} className="col-span-3" />
              </div>
              {/* Additional fields would be added here */}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsEditModalOpen(false)}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>Are you sure you want to delete this account? This action cannot be undone.</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="py-4">
              <p>
                <strong>Name:</strong> {selectedUser.fullName}
              </p>
              <p>
                <strong>Email:</strong> {selectedUser.email}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteUser}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
