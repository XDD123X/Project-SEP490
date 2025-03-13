import { useState, useEffect } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

// Icons
import { ArrowUpDown, CalendarIcon, Download, MoreHorizontal, Pencil, Plus, Search, Trash2, Upload } from "lucide-react";

// TanStack Table
import { flexRender, getCoreRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";

// Excel library
import * as XLSX from "xlsx";

// Schema and Data
const accounts = [
  {
    id: "1",
    email: "john.doe@example.com",
    fullName: "John Doe",
    role: "Admin",
    fullTime: true,
    phone: "123-456-7890",
    dob: new Date("1985-05-15"),
    avatar: "/placeholder.svg?height=40&width=40",
    status: "Active",
    createdAt: new Date("2023-01-10"),
    updatedAt: new Date("2023-01-10"),
  },
  {
    id: "2",
    email: "jane.smith@example.com",
    fullName: "Jane Smith",
    role: "Manager",
    fullTime: true,
    phone: "234-567-8901",
    dob: new Date("1990-08-22"),
    avatar: "/placeholder.svg?height=40&width=40",
    status: "Active",
    createdAt: new Date("2023-02-15"),
    updatedAt: new Date("2023-03-20"),
  },
  {
    id: "3",
    email: "bob.johnson@example.com",
    fullName: "Bob Johnson",
    role: "User",
    fullTime: false,
    phone: "345-678-9012",
    dob: new Date("1988-11-30"),
    avatar: "/placeholder.svg?height=40&width=40",
    status: "Inactive",
    createdAt: new Date("2023-03-05"),
    updatedAt: new Date("2023-04-10"),
  },
  {
    id: "4",
    email: "alice.williams@example.com",
    fullName: "Alice Williams",
    role: "User",
    fullTime: true,
    phone: "456-789-0123",
    dob: new Date("1992-02-18"),
    avatar: "/placeholder.svg?height=40&width=40",
    status: "Active",
    createdAt: new Date("2023-04-20"),
    updatedAt: new Date("2023-04-20"),
  },
  {
    id: "5",
    email: "charlie.brown@example.com",
    fullName: "Charlie Brown",
    role: "Manager",
    fullTime: false,
    phone: "567-890-1234",
    dob: new Date("1986-07-08"),
    avatar: "/placeholder.svg?height=40&width=40",
    status: "Pending",
    createdAt: new Date("2023-05-12"),
    updatedAt: new Date("2023-06-01"),
  },
  {
    id: "6",
    email: "david.miller@example.com",
    fullName: "David Miller",
    role: "User",
    fullTime: true,
    phone: "678-901-2345",
    dob: new Date("1991-03-25"),
    avatar: "/placeholder.svg?height=40&width=40",
    status: "Active",
    createdAt: new Date("2023-06-15"),
    updatedAt: new Date("2023-06-15"),
  },
  {
    id: "7",
    email: "emma.wilson@example.com",
    fullName: "Emma Wilson",
    role: "Manager",
    fullTime: true,
    phone: "789-012-3456",
    dob: new Date("1989-12-10"),
    avatar: "/placeholder.svg?height=40&width=40",
    status: "Active",
    createdAt: new Date("2023-07-01"),
    updatedAt: new Date("2023-07-20"),
  },
  {
    id: "8",
    email: "frank.thomas@example.com",
    fullName: "Frank Thomas",
    role: "User",
    fullTime: false,
    phone: "890-123-4567",
    dob: new Date("1987-09-05"),
    avatar: "/placeholder.svg?height=40&width=40",
    status: "Inactive",
    createdAt: new Date("2023-08-10"),
    updatedAt: new Date("2023-09-15"),
  },
  {
    id: "9",
    email: "grace.lee@example.com",
    fullName: "Grace Lee",
    role: "Admin",
    fullTime: true,
    phone: "901-234-5678",
    dob: new Date("1993-06-30"),
    avatar: "/placeholder.svg?height=40&width=40",
    status: "Active",
    createdAt: new Date("2023-09-20"),
    updatedAt: new Date("2023-09-20"),
  },
  {
    id: "10",
    email: "henry.garcia@example.com",
    fullName: "Henry Garcia",
    role: "User",
    fullTime: false,
    phone: "012-345-6789",
    dob: new Date("1990-01-15"),
    avatar: "/placeholder.svg?height=40&width=40",
    status: "Pending",
    createdAt: new Date("2023-10-05"),
    updatedAt: new Date("2023-10-25"),
  },
];

// Confirm Dialog Component
function ConfirmDialog({ open, onOpenChange, onConfirm, title, description }) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent onEscapeKeyDown={() => onOpenChange(false)}>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            className="bg-destructive text-destructive-foreground"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Add Account Dialog Component
function AddAccountDialog({ open, onOpenChange, onAdd }) {
  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    role: "User",
    fullTime: false,
    phone: "",
    dob: new Date(),
    avatar: "/placeholder.svg?height=40&width=40",
    status: "Active",
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    const newAccount = {
      ...formData,
      id: `account-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    onAdd(newAccount);
    onOpenChange(false); // Explicitly close the dialog

    // Reset form
    setFormData({
      email: "",
      fullName: "",
      role: "User",
      fullTime: false,
      phone: "",
      dob: new Date(),
      avatar: "/placeholder.svg?height=40&width=40",
      status: "Active",
    });
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={true}>
      <DialogContent className="sm:max-w-[500px]" onInteractOutside={() => onOpenChange(false)}>
        <DialogHeader>
          <DialogTitle>Add New Account</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="flex items-center justify-center mb-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={formData.avatar} alt="Avatar" />
                <AvatarFallback>{formData.fullName ? formData.fullName.charAt(0) : "A"}</AvatarFallback>
              </Avatar>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={formData.email} onChange={(e) => handleChange("email", e.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" value={formData.fullName} onChange={(e) => handleChange("fullName", e.target.value)} required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={formData.role} onValueChange={(value) => handleChange("role", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Manager">Manager</SelectItem>
                    <SelectItem value="User">User</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={formData.phone} onChange={(e) => handleChange("phone", e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !formData.dob && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.dob ? format(formData.dob, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={formData.dob} onSelect={(date) => handleChange("dob", date || new Date())} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="fullTime" checked={formData.fullTime} onCheckedChange={(checked) => handleChange("fullTime", !!checked)} />
              <Label htmlFor="fullTime">Full Time Employee</Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="avatar">Avatar</Label>
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={formData.avatar} alt="Avatar" />
                  <AvatarFallback>{formData.fullName ? formData.fullName.charAt(0) : "A"}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          handleChange("avatar", event.target?.result);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <p className="text-sm text-muted-foreground mt-1">Upload a profile picture</p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Add Account</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Edit Account Dialog Component
function EditAccountDialog({ account, open, onOpenChange, onUpdate }) {
  const [formData, setFormData] = useState(account);

  useEffect(() => {
    setFormData(account);
  }, [account]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const updatedAccount = {
      ...formData,
      updatedAt: new Date(),
    };

    onUpdate(updatedAccount);
    onOpenChange(false); // Explicitly close the dialog
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={true}>
      <DialogContent className="sm:max-w-[600px]" onInteractOutside={() => onOpenChange(false)}>
        <DialogHeader>
          <DialogTitle>Edit Account</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="flex items-center justify-center mb-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={formData.avatar} alt="Avatar" />
                <AvatarFallback>{formData.fullName.charAt(0)}</AvatarFallback>
              </Avatar>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={formData.email} onChange={(e) => handleChange("email", e.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" value={formData.fullName} onChange={(e) => handleChange("fullName", e.target.value)} required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={formData.role} onValueChange={(value) => handleChange("role", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Manager">Manager</SelectItem>
                    <SelectItem value="User">User</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={formData.phone} onChange={(e) => handleChange("phone", e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !formData.dob && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.dob ? format(formData.dob, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={formData.dob} onSelect={(date) => handleChange("dob", date || new Date())} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="fullTime" checked={formData.fullTime} onCheckedChange={(checked) => handleChange("fullTime", !!checked)} />
              <Label htmlFor="fullTime">Full Time Employee</Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="avatar">Avatar</Label>
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={formData.avatar} alt="Avatar" />
                  <AvatarFallback>{formData.fullName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          handleChange("avatar", event.target?.result);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <p className="text-sm text-muted-foreground mt-1">Upload a new profile picture</p>
                </div>
              </div>
            </div>

            <Separator className="my-2" />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="createdAt">Created At</Label>
                <Input id="createdAt" value={format(formData.createdAt, "PPP p")} disabled />
              </div>

              <div className="space-y-2">
                <Label htmlFor="updatedAt">Updated At</Label>
                <Input id="updatedAt" value={format(formData.updatedAt, "PPP p")} disabled />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Update Account</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Data Table Component
function DataTable({ columns, data, onUpdate, onDelete }) {
  const [sorting, setSorting] = useState([]);
  const [editingAccount, setEditingAccount] = useState(null);
  const [deletingAccountId, setDeletingAccountId] = useState(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);

  const handleEdit = (account) => {
    setEditingAccount(account);
    setIsUpdateDialogOpen(true);
  };

  const handleDelete = (id) => {
    setDeletingAccountId(id);
    setIsRemoveDialogOpen(true);
  };

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
    meta: {
      onEdit: handleEdit,
      onDelete: handleDelete,
    },
  });

  const confirmDelete = () => {
    if (deletingAccountId) {
      onDelete(deletingAccountId);
      setDeletingAccountId(null);
      setIsRemoveDialogOpen(false);
    }
  };

  const handleUpdateAccount = (updatedAccount) => {
    onUpdate(updatedAccount);
    setIsUpdateDialogOpen(false);
    setEditingAccount(null);
  };

  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Rows per page</p>
          <select
            className="h-8 w-[70px] rounded-md border border-input bg-background px-2"
            value={table.getState().pagination.pageSize}
            onChange={(e) => {
              table.setPageSize(Number(e.target.value));
            }}
          >
            {[5, 10, 20, 50].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                {pageSize}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1 text-sm text-muted-foreground text-center">
          Showing {table.getRowModel().rows.length} of {data.length} account(s)
        </div>
        <div className="space-x-2">
          <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            Previous
          </Button>
          <span className="text-sm">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </span>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Next
          </Button>
        </div>
      </div>

      {editingAccount && (
        <EditAccountDialog
          account={editingAccount}
          open={isUpdateDialogOpen}
          onOpenChange={(open) => {
            setIsUpdateDialogOpen(open);
            if (!open) {
              setTimeout(() => {
                setEditingAccount(null);
              }, 100);
            }
          }}
          onUpdate={handleUpdateAccount}
        />
      )}

      <ConfirmDialog
        open={isRemoveDialogOpen}
        onOpenChange={(open) => {
          setIsRemoveDialogOpen(open);
          if (!open) {
            setTimeout(() => {
              setDeletingAccountId(null);
            }, 100);
          }
        }}
        onConfirm={confirmDelete}
        title="Delete Account"
        description="Are you sure you want to delete this account? This action cannot be undone."
      />
    </div>
  );
}

// Main Account Management Component
export default function AccountManagementPage() {
  const [data, setData] = useState(accounts);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const filteredData = data.filter((account) => {
    if (!searchQuery) return true;

    const searchLower = searchQuery.toLowerCase();
    return (
      account.email.toLowerCase().includes(searchLower) ||
      account.fullName.toLowerCase().includes(searchLower) ||
      account.role.toLowerCase().includes(searchLower) ||
      account.phone.toLowerCase().includes(searchLower) ||
      account.status.toLowerCase().includes(searchLower)
    );
  });

  const handleAddAccount = (newAccount) => {
    setData([...data, newAccount]);
    setIsAddDialogOpen(false);
  };

  const handleUpdateAccount = (updatedAccount) => {
    setData(data.map((account) => (account.id === updatedAccount.id ? updatedAccount : account)));
  };

  const handleDeleteAccount = (id) => {
    setData(data.filter((account) => account.id !== id));
  };

  const handleImportExcel = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const workbook = XLSX.read(event.target?.result, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const importedData = XLSX.utils.sheet_to_json(worksheet);

        // Transform imported data to match Account schema
        const transformedData = importedData.map((item, index) => ({
          id: `imported-${Date.now()}-${index}`,
          email: item.email || "",
          fullName: item.fullName || "",
          role: item.role || "User",
          fullTime: Boolean(item.fullTime),
          phone: item.phone || "",
          dob: item.dob ? new Date(item.dob) : new Date(),
          avatar: item.avatar || "/placeholder.svg?height=40&width=40",
          status: item.status || "Active",
          createdAt: new Date(),
          updatedAt: new Date(),
        }));

        setData([...data, ...transformedData]);
      } catch (error) {
        console.error("Error importing Excel file:", error);
        alert("Error importing Excel file. Please check the format.");
      }
    };
    reader.readAsBinaryString(file);

    // Reset the input
    e.target.value = "";
  };

  const handleExportExcel = () => {
    const exportData = data.map(({ id, avatar, ...rest }) => ({
      ...rest,
      fullTime: rest.fullTime ? "Yes" : "No",
      dob: rest.dob.toLocaleDateString(),
      createdAt: rest.createdAt.toLocaleDateString(),
      updatedAt: rest.updatedAt.toLocaleDateString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Accounts");
    XLSX.writeFile(workbook, "accounts.xlsx");
  };

  // Column definitions
  const columns = [
    {
      id: "avatar",
      header: "",
      cell: ({ row }) => {
        const account = row.original;
        return (
          <Avatar className="h-8 w-8">
            <AvatarImage src={account.avatar} alt={account.fullName} />
            <AvatarFallback>{account.fullName.charAt(0)}</AvatarFallback>
          </Avatar>
        );
      },
    },
    {
      accessorKey: "email",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Email
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => <div className="font-medium">{row.getValue("email")}</div>,
    },
    {
      accessorKey: "fullName",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Full Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
    },
    {
      accessorKey: "role",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Role
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
    },
    {
      accessorKey: "fullTime",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Full Time
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => <Checkbox checked={row.getValue("fullTime")} disabled />,
    },
    {
      accessorKey: "phone",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Phone
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
    },
    {
      accessorKey: "dob",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Date of Birth
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const date = row.getValue("dob");
        return <div>{date.toLocaleDateString()}</div>;
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Status
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const status = row.getValue("status");
        return <Badge variant={status === "Active" ? "default" : "secondary"}>{status}</Badge>;
      },
    },
    {
      id: "actions",
      cell: ({ row, table }) => {
        const account = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  const { onEdit } = table.options.meta;
                  onEdit?.(account);
                }}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  const { onDelete } = table.options.meta;
                  onDelete?.(account.id);
                }}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Account Management</h1>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search accounts..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-8" />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Account
            </Button>
            <div className="relative">
              <Button variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Import
                <Input type="file" accept=".xlsx, .xls" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImportExcel} />
              </Button>
            </div>
            <Button variant="outline" onClick={handleExportExcel}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        <DataTable columns={columns} data={filteredData} onUpdate={handleUpdateAccount} onDelete={handleDeleteAccount} />

        <AddAccountDialog
          open={isAddDialogOpen}
          onOpenChange={(open) => {
            setIsAddDialogOpen(open);
          }}
          onAdd={handleAddAccount}
        />
      </div>
    </div>
  );
}
