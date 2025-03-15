import { useEffect, useState } from "react";
import { Calendar, Clock, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useStore } from "@/services/StoreContext";
import { toast } from "sonner";
import { GetClassListByStudentId } from "@/services/classService";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function StudentClassPage() {
  const [classList, setClassList] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { state } = useStore();
  const { user } = state;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await GetClassListByStudentId(user.uid);
        console.log("class list by id: ", response.data);
        setClassList(response.data);
      } catch (error) {
        toast.error("Error", error);
      }
    };
    fetchData();
  }, []);

  const handleDetailClick = (classItem) => {
    setSelectedClass(classItem);
    console.log("item class: ", classItem);
    setIsDialogOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "1":
        return "bg-green-500";
      case "0":
        return "bg-blue-500";
      case "2":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">My Classes</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classList.map((classItem, index) => (
          <Card key={index} className="h-full flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl">{classItem.className}</CardTitle>
                <Badge className={getStatusColor(classItem.status)}>
                  {classItem.status === 0 ? "Upcoming" : ""}
                  {classItem.status === 1 ? "Studying" : ""}
                  {classItem.status === 2 ? "Finished" : ""}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">Code: {classItem.classCode}</p>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="space-y-3">
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  <span>Lecturer: {classItem.lecturer?.fullName || "No Lecturer Assigned"}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>Total Sessions: {classItem.totalSession}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>Start Date: {format(new Date(classItem.startDate), "dd/MM/yyyy")}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>End Date: {format(new Date(classItem.endDate), "dd/MM/yyyy")}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button variant="outline" onClick={() => handleDetailClick(classItem)} className="flex-1">
                Detail
              </Button>
              <Button className="flex-1" onClick={() => window.open(classItem.classUrl, "_blank")}>
                Online Class
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {selectedClass && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{selectedClass.className}</DialogTitle>
              <DialogDescription>Class Code: {selectedClass.classCode}</DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <h3 className="font-semibold mb-2">Class Information</h3>
                <ul className="space-y-2">
                  <li>
                    <span className="font-medium">Status:</span> {selectedClass.status}
                  </li>
                  <li>
                    <span className="font-medium">Lecturer:</span> {selectedClass.lecture?.fullName || "No Lecturer Assigned"}
                  </li>
                  <li>
                    <span className="font-medium">Total Sessions:</span> {selectedClass.totalSession}
                  </li>
                  <li>
                    <span className="font-medium">Start Date:</span> {new Date(selectedClass.startDate).toLocaleDateString()}
                  </li>
                  <li>
                    <span className="font-medium">End Date:</span> {new Date(selectedClass.endDate).toLocaleDateString()}
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Course Information</h3>
                <p>{selectedClass.courseInformation}</p>
              </div>
            </div>
            <div className="w-full mt-4">
              <Button asChild className="w-full">
                <Link href={selectedClass.classUrl} target="_blank" className="w-full text-center">
                  Join Online Class
                </Link>
              </Button>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Student List</h3>
              <ScrollArea className="h-72 w-full">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead></TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {selectedClass.classStudents?.map((cs, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <img className="w-20 h-20 rounded-lg" src={cs.student?.imgUrl || "/default-avatar.png"} alt="Student Avatar" />
                        </TableCell>
                        <TableCell>{cs.student?.fullName || "N/A"}</TableCell>
                        <TableCell>{cs.student?.email || "N/A"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
