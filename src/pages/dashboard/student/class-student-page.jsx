import { useEffect, useState } from "react";
import { Calendar, Clock, Eye, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
import { useStore } from "@/services/StoreContext";
import { toast } from "sonner";
import { GetClassListByStudentId } from "@/services/classService";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Helmet } from "react-helmet-async";

const GLOBAL_NAME = import.meta.env.VITE_GLOBAL_NAME;

export default function StudentClassPage() {
  const [classList, setClassList] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { state } = useStore();
  const { user } = state;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await GetClassListByStudentId(user.uid);
        setClassList(response.data);
        console.log(classList);
      } catch (error) {
        toast.error("Error", error);
      }
    };
    fetchData();
  }, []);

  const handleDetailClick = (classItem) => {
    setSelectedClass(classItem);
    setIsDialogOpen(true);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Helmet>
        <title>{GLOBAL_NAME} - My Class</title>
        <meta name="description" content={`${GLOBAL_NAME} - Online Teaching Center.`} />
      </Helmet>
      <h1 className="text-3xl font-bold mb-8">My Classes</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classList.length > 0 ? (
          classList.map((classItem, index) => (
            <Card key={index} className="h-full flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{classItem.className}</CardTitle>
                  <Badge
                    variant={
                      classItem.status === 0
                        ? "destructive" // Disabled
                        : classItem.status === 1
                        ? "secondary" // Upcoming
                        : classItem.status === 2
                        ? "info" // Studying
                        : "success" // Finished
                    }
                  >
                    {classItem.status === 0 ? "Disabled" : classItem.status === 1 ? "Upcoming" : classItem.status === 2 ? "Studying" : "Finished"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">Code: {classItem.classCode}</p>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    <span>{classItem.lecturer ? `Lecturer: ${classItem.lecturer.gender === false ? "Ms. " : "Mr. "} ${classItem.lecturer.fullName}` : "Lecturer: No Lecturer Assigned"}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>Total Sessions: {classItem.totalSession}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>Start Date: {classItem.startDate ? format(new Date(classItem.startDate), "dd/MM/yyyy") : "TBD"}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>End Date: {classItem.endDate ? format(new Date(classItem.endDate), "dd/MM/yyyy") : "TBD"}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button variant="outline" onClick={() => handleDetailClick(classItem)} className="flex-1">
                  Detail
                </Button>
                <Button className="flex-1" onClick={() => window.open(classItem.lecturer.meetUrl, "_blank")}>
                  Online Meeting
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">Student has not been registered for any classes yet.</p>
        )}
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
                <h3 className="font-semibold mb-4 text-lg uppercase">Class Information</h3>
                <ul className="space-y-2">
                  <li>
                    <span className="font-medium mr-1">Status:</span>
                    <Badge
                      variant={
                        selectedClass.status === 0
                          ? "destructive" // Disabled
                          : selectedClass.status === 1
                          ? "secondary" // Upcoming
                          : selectedClass.status === 2
                          ? "info" // Studying
                          : "success" // Finished
                      }
                    >
                      {selectedClass.status === 0 ? "Cancelled" : selectedClass.status === 1 ? "Upcoming" : selectedClass.status === 2 ? "Studying" : "Finished"}
                    </Badge>{" "}
                  </li>
                  <li>
                    <span className="font-medium">Lecturer:</span> {selectedClass.lecturer.gender === false ? "Ms. " : "Mr. "} {selectedClass.lecturer?.fullName || "No Lecturer Assigned"}
                  </li>
                  <li>
                    <span className="font-medium">Total Sessions:</span> {selectedClass.totalSession}
                  </li>
                  <li>
                    <span className="font-medium">Start Date:</span> {selectedClass.startDate ? format(selectedClass.startDate, "dd/MM/yyy") : "TBD"}
                  </li>
                  <li>
                    <span className="font-medium">End Date:</span> {selectedClass.endDate ? format(selectedClass.endDate, "dd/MM/yyy") : "TBD"}
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4 text-lg uppercase">Course Information</h3>
                <ul className="space-y-2">
                  <li>
                    <span className="font-medium">Course:</span>
                    <span className="ml-1">{selectedClass.course.courseName}</span>
                  </li>
                  <li>
                    <span className="font-medium">Detail:</span>
                    <span className="ml-1">{selectedClass.course.description}</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="w-full mt-4">
              <Button asChild className="w-full">
                <Link onClick={() => window.open(selectedClass.lecturer.meetUrl, "_blank")} target="_blank" className="w-full text-center">
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
                      {/* <TableHead></TableHead> */}
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
                        {/* <TableCell>
                          <Button variant="outline" size="icon" onClick={() => navigate(`/account/${cs.student.accountId}`)}>
                            <Eye />
                          </Button>
                        </TableCell> */}
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
