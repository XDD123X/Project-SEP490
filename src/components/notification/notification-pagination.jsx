import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function NotificationPagination({ currentPage, totalPages, onPageChange, itemsPerPage, onItemsPerPageChange }) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <p className="text-xs text-muted-foreground">Items per page</p>
        <Select value={itemsPerPage.toString()} onValueChange={(value) => onItemsPerPageChange(Number.parseInt(value))}>
          <SelectTrigger className="h-7 w-[60px] text-xs">
            <SelectValue placeholder={itemsPerPage.toString()} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5</SelectItem>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-1">
        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => onPageChange(1)} disabled={currentPage === 1}>
          <ChevronsLeft className="h-3 w-3" />
          <span className="sr-only">First page</span>
        </Button>
        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
          <ChevronLeft className="h-3 w-3" />
          <span className="sr-only">Previous page</span>
        </Button>
        <div className="flex items-center gap-1 mx-1">
          <span className="text-xs font-medium">
            Page {currentPage} of {totalPages}
          </span>
        </div>
        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>
          <ChevronRight className="h-3 w-3" />
          <span className="sr-only">Next page</span>
        </Button>
        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages}>
          <ChevronsRight className="h-3 w-3" />
          <span className="sr-only">Last page</span>
        </Button>
      </div>
    </div>
  );
}
