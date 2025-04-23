import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil } from "lucide-react";
import { CardFooter } from "react-bootstrap";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

export function ClassInfoCard({ classData, setSelectedClass }) {
  const navigate = useNavigate();
  const handleResetClass = () => {
    setSelectedClass(null); // Đặt selectedClass thành null
    navigate("/officer/class/add-student"); // Điều hướng đến trang add-student
  };
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Class Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-2 text-sm">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Class Code</p>
            <p className="font-medium">{classData.classCode}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Class Name</p>
            <p className="font-medium">{classData.className}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Course</p>
            <p className="font-medium">{classData.course.courseName}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Lecturer</p>
            <p className="font-medium">{classData.lecturer ? `${classData.lecturer.gender ? "Mr." : "Ms."} ${classData.lecturer.fullName}` : "Not Assigned Yet"}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Start</p>
            <p className="font-medium">{classData.startDate ? format(classData.startDate, "dd/MM/yyyy") : "TBD"}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">End</p>
            <p className="font-medium">{classData.endDate ? format(classData.endDate, "dd/MM/yyyy") : "TBD"}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Total Sessions</p>
            <p className="font-medium">{classData.totalSession}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Students</p>
            <p className="font-medium">{classData.classStudents.length}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="ml-4 mb-4 flex items-center gap-2" onClick={handleResetClass}>
          <Pencil className="w-5 h-5" />
          Change Class
        </Button>
      </CardFooter>
    </Card>
  );
}
