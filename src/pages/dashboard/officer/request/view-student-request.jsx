import { useState, useMemo, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Check, X, Eye, ChevronUp, ChevronDown, Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Separator } from "@/components/ui/separator";
import { RequestBadge } from "@/components/BadgeComponent";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useStore } from "@/services/StoreContext";
import { toast } from "sonner";
import { GetStudentRequests, UpdateStudentRequest } from "@/services/studentRequestService";

export default function StudentRequestManagement() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [requests, setRequests] = useState();
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [currentRequest, setCurrentRequest] = useState(null);
  const [actionDescription, setActionDescription] = useState("");
  const { state } = useStore();
  const { user } = state;

  //fetch data
  const fetchData = async () => {
    try {
      const response = await GetStudentRequests();
      if (response.status === 200 && response.data != null) {
        setRequests(response.data);
      }
    } catch (error) {
      toast.error(error);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filteredAndSortedRequests = useMemo(() => {
    // Kiểm tra xem requests có hợp lệ chưa (không undefined hoặc null)
    if (!Array.isArray(requests)) {
      return []; // Nếu requests chưa được khởi tạo, trả về mảng rỗng
    }

    // First filter by status
    let filtered = [...requests];
    if (statusFilter !== "all") {
      const statusNumber = Number.parseInt(statusFilter);
      filtered = filtered.filter((req) => req.status === statusNumber);
    }

    // Then filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((req) => req.account.fullName.toLowerCase().includes(query) || req.account.email.toLowerCase().includes(query) || (req.description && req.description.toLowerCase().includes(query)));
    }

    // Then sort
    if (sortConfig.key && sortConfig.direction) {
      filtered.sort((a, b) => {
        let aValue;
        let bValue;

        // Handle nested properties
        if (sortConfig.key === "account.fullName") {
          aValue = a.account.fullName;
          bValue = b.account.fullName;
        } else if (sortConfig.key === "account.email") {
          aValue = a.account.email;
          bValue = b.account.email;
        } else {
          aValue = a[sortConfig.key];
          bValue = b[sortConfig.key];
        }

        if (aValue === null) return 1;
        if (bValue === null) return -1;

        if (typeof aValue === "string") {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [requests, statusFilter, searchQuery, sortConfig]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredAndSortedRequests.length / rowsPerPage);
  const paginatedRequests = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredAndSortedRequests.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredAndSortedRequests, currentPage, rowsPerPage]);

  // Reset to first page when filters change or rows per page changes
  useMemo(() => {
    setCurrentPage(1);
  }, [statusFilter, searchQuery, rowsPerPage]);

  // Function to handle sorting
  const requestSort = (key) => {
    let direction;

    if (sortConfig.key === key) {
      if (sortConfig.direction === "ascending") {
        direction = "descending";
      } else if (sortConfig.direction === "descending") {
        direction = null;
      }
    }

    setSortConfig({ key, direction });
  };

  // Function to get sort direction icon
  const getSortDirectionIcon = (key) => {
    if (sortConfig.key !== key) {
      return null;
    }
    return sortConfig.direction === "ascending" ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />;
  };

  // Function to open the comparison modal
  const openCompareDialog = (request) => {
    setCurrentRequest(request);
    setIsCompareOpen(true);
  };

  // Function to handle accept/reject actions
  const handleAction = (request, action) => {
    setCurrentRequest(request);
    setActionType(action);
    setActionDescription("");
    setIsActionDialogOpen(true);
  };

  // Function to confirm the action
  const confirmAction = async () => {
    if (!currentRequest || !actionType || !actionDescription.trim()) return;

    const updateModel = {
      requestChangeId: currentRequest.requestChangeId,
      approvedBy: user.uid,
      description: actionDescription,
      status: actionType === "accept" ? 1 : 2,
      officer: currentRequest.approvedByNavigation,
    };

    try {
      // Gọi hàm UpdateRequest và chờ kết quả
      const response = await UpdateStudentRequest(updateModel);
      console.log(response);

      if (response.status === 204) {
        toast.success(`Request ${actionType}ed successfully.`);
        fetchData();
      } else {
        toast.error(`Request ${actionType}ed failed.`);
      }

      // Đóng dialog sau khi cập nhật thành công
      setIsActionDialogOpen(false);
    } catch (error) {
      console.error("Error during action confirmation:", error);
    }
  };

  // Function to generate pagination items
  const generatePaginationItems = () => {
    const items = [];

    // Always show first page
    items.push(
      <PaginationItem key="first">
        <PaginationLink onClick={() => setCurrentPage(1)} isActive={currentPage === 1}>
          1
        </PaginationLink>
      </PaginationItem>
    );

    // Show ellipsis if needed
    if (currentPage > 3) {
      items.push(
        <PaginationItem key="ellipsis-1">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    // Show current page and surrounding pages
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      if (i === 1 || i === totalPages) continue; // Skip first and last page as they're always shown
      items.push(
        <PaginationItem key={i}>
          <PaginationLink onClick={() => setCurrentPage(i)} isActive={currentPage === i}>
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    // Show ellipsis if needed
    if (currentPage < totalPages - 2) {
      items.push(
        <PaginationItem key="ellipsis-2">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    // Always show last page if there's more than one page
    if (totalPages > 1) {
      items.push(
        <PaginationItem key="last">
          <PaginationLink onClick={() => setCurrentPage(totalPages)} isActive={currentPage === totalPages}>
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Student Request Management</CardTitle>
          <CardDescription>Manage student avatar change requests. You can view, accept, or reject pending requests.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="w-full sm:w-48">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="0">Pending</SelectItem>
                    <SelectItem value="1">Accepted</SelectItem>
                    <SelectItem value="2">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search by name, email..." className="pl-8" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              Showing {filteredAndSortedRequests.length > 0 ? Math.min(filteredAndSortedRequests.length, (currentPage - 1) * rowsPerPage + 1) : 0} - {Math.min(filteredAndSortedRequests.length, currentPage * rowsPerPage)} of
              {filteredAndSortedRequests.length} requests
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead className="cursor-pointer" onClick={() => requestSort("account.fullName")}>
                  <div className="flex items-center">
                    Student Name
                    {getSortDirectionIcon("account.fullName")}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => requestSort("account.email")}>
                  <div className="flex items-center">
                    Email
                    {getSortDirectionIcon("account.email")}
                  </div>
                </TableHead>
                <TableHead>Current</TableHead>
                <TableHead>New</TableHead>
                <TableHead className="cursor-pointer" onClick={() => requestSort("status")}>
                  <div className="flex items-center">
                    Status
                    {getSortDirectionIcon("status")}
                  </div>
                </TableHead>
                <TableHead>Approved By</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedRequests.map((request, index) => (
                <TableRow key={request.accountId}>
                  <TableCell className="font-medium">{(currentPage - 1) * rowsPerPage + index + 1}</TableCell>
                  <TableCell>{request.account.fullName}</TableCell>
                  <TableCell>{request.account.email}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <img src={request.imgUrlOld || "/placeholder.svg"} alt="Current avatar" className="w-10 h-10 rounded-full object-cover" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <img src={request.imgUrlNew || "/placeholder.svg"} alt="New avatar" className="w-10 h-10 rounded-full object-cover" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <RequestBadge status={request.status} />
                  </TableCell>
                  <TableCell>{request.approvedByNavigation?.fullName || "-"}</TableCell>
                  <TableCell>
                    <div className="max-w-[200px] truncate">{request.description || "-"}</div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end items-center space-x-2">
                      {request.status === 0 && (
                        <>
                          <Button variant="outline" size="sm" className="font-semibold bg-green-600 hover:bg-green-700 text-white dark:bg-green-700 dark:hover:bg-green-800 dark:border-0" onClick={() => handleAction(request, "accept")}>
                            <Check className="h-4 w-4" />
                            Accept
                          </Button>
                          <Button variant="outline" size="sm" className="font-semibold bg-red-600 hover:bg-red-700 text-white dark:bg-red-700 dark:hover:bg-red-800 dark:border-0" onClick={() => handleAction(request, "reject")}>
                            <X className="h-4 w-4" />
                            Reject
                          </Button>
                        </>
                      )}
                      <Button variant="outline" size="icon" onClick={() => openCompareDialog(request)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Rows per page:</span>
            <Select value={rowsPerPage.toString()} onValueChange={(value) => setRowsPerPage(Number.parseInt(value))}>
              <SelectTrigger className="w-16">
                <SelectValue placeholder="10" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} className={currentPage === 1 ? "pointer-events-none opacity-50" : ""} />
                </PaginationItem>

                {generatePaginationItems()}

                <PaginationItem>
                  <PaginationNext onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""} />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardFooter>
      </Card>

      {/* Avatar Comparison Dialog (Carousel with Request Info) */}
      <Dialog open={isCompareOpen} onOpenChange={setIsCompareOpen}>
        <DialogContent className="sm:max-w-3xl w-full">
          <DialogHeader>
            <DialogTitle>Avatar Change Request</DialogTitle>
          </DialogHeader>

          {currentRequest && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left side: Request Information */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">Student Information</h3>
                  <div className="space-y-2 mt-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name:</span>
                      <span className="font-medium">{currentRequest.account.fullName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email:</span>
                      <span>{currentRequest.account.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phone:</span>
                      <span>{currentRequest.account.phoneNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Gender:</span>
                      <span>{currentRequest.account.gender ? "Male" : "Female"}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold">Request Status</h3>
                  <div className="space-y-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Status:</span>
                      <span>
                        <RequestBadge status={currentRequest.status} />
                      </span>
                    </div>

                    {currentRequest.status !== 0 && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Processed by:</span>
                          <span>{currentRequest.approvedByNavigation?.fullName || "-"}</span>
                        </div>

                        {currentRequest.approvedDate && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Date:</span>
                            <span>{new Date(currentRequest.approvedDate).toLocaleString()}</span>
                          </div>
                        )}
                      </>
                    )}

                    {currentRequest.description && (
                      <div className="flex flex-col">
                        <span className="text-muted-foreground">Description/Reason:</span>
                        <span className="mt-1">{currentRequest.description}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right side: Avatar Carousel */}
              <div className="flex flex-col items-center px-10">
                <Carousel className="w-full max-w-xs ">
                  <CarouselContent>
                    <CarouselItem>
                      <div className="p-1 ">
                        <Card className="">
                          <CardContent className="flex flex-col aspect-square items-center justify-center p-0">
                            <img src={currentRequest.imgUrlOld || "/placeholder.svg"} alt={"Current avatar"} className="w-full h-full object-cover rounded-lg " />
                            {/* <span className="mt-2 text-center text-sm font-medium">Old</span> */}
                          </CardContent>
                        </Card>
                        <p className="w-full text-center mt-4 uppercase font-semibold">Old</p>
                      </div>
                    </CarouselItem>
                    <CarouselItem>
                      <div className="p-1">
                        <Card>
                          <CardContent className="flex flex-col aspect-square items-center justify-center p-0">
                            <img src={currentRequest.imgUrlNew || "/placeholder.svg"} alt={"New avatar"} className="w-full h-full object-cover rounded-lg" />
                          </CardContent>
                        </Card>
                        <p>New</p>
                      </div>
                    </CarouselItem>
                  </CarouselContent>
                  <CarouselPrevious /> <CarouselNext />
                </Carousel>
              </div>
            </div>
          )}
          <DialogFooter>
            {currentRequest && currentRequest.status === 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 w-full">
                <div className="flex justify-center space-x-2 pt-2 md:col-start-2 md:ml-[25px]">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white dark:bg-green-700 dark:hover:bg-green-800 dark:border-0"
                    onClick={() => {
                      setIsCompareOpen(false);
                      handleAction(currentRequest, "accept");
                    }}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Accept
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-red-600 hover:bg-red-700 text-white dark:bg-red-700 dark:hover:bg-red-800 dark:border-0"
                    onClick={() => {
                      setIsCompareOpen(false);
                      handleAction(currentRequest, "reject");
                    }}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Decline
                  </Button>
                </div>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Action Confirmation Dialog */}
      <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{actionType === "accept" ? "Accept Request" : "Reject Request"}</DialogTitle>
            <DialogDescription>Please provide a description for {actionType === "accept" ? "accepting" : "rejecting"} this request.</DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Input placeholder={actionType === "accept" ? "Reason for acceptance" : "Reason for rejection"} value={actionDescription} onChange={(e) => setActionDescription(e.target.value)} />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsActionDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmAction} className={actionType === "accept" ? "bg-green-600" : "bg-red-600"} disabled={!actionDescription.trim()}>
              {actionType === "accept" ? "Accept" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
