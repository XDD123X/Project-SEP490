import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function StudentDetailsDialog({ student, isOpen, onClose }) {
  if (!student) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Student Details</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-4 py-4">
          <Avatar className="h-24 w-24">
            <AvatarImage src={student.imgUrl} alt={student.fullName} />
            <AvatarFallback>{student.fullName.charAt(0)}</AvatarFallback>
          </Avatar>
          <h3 className="text-xl font-bold">{student.fullName}</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Email</p>
            <p>{student.email}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Phone</p>
            <p>{student.phoneNumber}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
            <p>{new Date(student.dob).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Gender</p>
            <p>{student.gender ? "Male" : "Female"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Full-time</p>
            <p>{student.fulltime ? "Yes" : "No"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Status</p>
            <p>{student.status === 1 ? "Active" : "Inactive"}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm font-medium text-muted-foreground">Meet URL</p>
            <p className="truncate">
              <a href={student.meetUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                {student.meetUrl}
              </a>
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
