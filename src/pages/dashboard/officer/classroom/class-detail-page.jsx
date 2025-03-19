import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/ui/spinner";
import { GetClassById } from "@/services/classService";
import { format } from "date-fns";
import { Eye } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

export default function ClassDetailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [currentClass, setCurrentClass] = useState(null);
  const classId = searchParams.get("classId");

  {
    /* <Badge
                    variant={
                      classItem.status === 0 ? "destructive"   // Disabled
                      : classItem.status === 1 ? "secondary"  // Upcoming
                      : classItem.status === 2 ? "info"    // Studying
                      : "success" // Finished
                    }
                  >
                    {classItem.status === 0 ? "Disabled"
                    : classItem.status === 1 ? "Upcoming"
                    : classItem.status === 2 ? "Studying"
                    : "Finished"}
                  </Badge> */
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 0:
        return <Badge variant="destructive">Disabled</Badge>;
      case 1:
        return <Badge variant="outline">Upcoming</Badge>;
      case 2:
        return <Badge variant="info">Studying</Badge>;
      case 3:
        return <Badge variant="success">Finished</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  useEffect(() => {
    if (!classId) {
      navigate("/officer/class", { replace: true });
    }
  }, [classId, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!classId) return;

      try {
        const classResponse = await GetClassById(classId);
        if (classResponse.status === 200) {
          setCurrentClass(classResponse.data);
        } else {
          toast.error("Class not found!");
          navigate("/404", { replace: true });
        }
      } catch (error) {
        toast.error("Error Occurred. Please Try Again.");
        navigate("/404", { replace: true });
      }
    };

    fetchData();
  }, [classId, navigate]);

  if (!currentClass)
    return (
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <Spinner />
      </div>
    );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Class Information</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Class Information Card */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Class Details</CardTitle>
            <CardDescription>Information about the current class</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="font-semibold">Class Code:</div>
                <div>{currentClass.classCode}</div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="font-semibold">Class Name:</div>
                <div>{currentClass.className}</div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="font-semibold">Course:</div>
                <div>{currentClass.course.courseName}</div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="font-semibold">Description:</div>
                <div>{currentClass.course.description}</div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="font-semibold">Lecturer:</div>
                <div>
                  {currentClass.lecturer.gender ? "Mr." : "Ms."} {currentClass.lecturer.fullName}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="font-semibold">Start Date:</div>
                <div>{currentClass?.startDate ? format(new Date(currentClass.startDate), "dd/MM/yyyy") : "TBD"}</div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="font-semibold">End Date:</div>
                <div>{currentClass?.endDate ? format(new Date(currentClass.endDate), "dd/MM/yyyy") : "TBD"}</div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="font-semibold">Total Sessions:</div>
                <div>{currentClass.totalSession}</div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="font-semibold">Meet URL:</div>
                <div>
                  <Link className="underline underline-offset-4 text-blue-500" to={currentClass.classUrl} target="_blank">
                    {currentClass.classUrl}
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="font-semibold">Status:</div>
                <div>{getStatusBadge(currentClass.status)}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Students Card */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Students</CardTitle>
            <CardDescription>Students enrolled in this class</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px] pr-4">
              {currentClass?.classStudents?.length > 0 ? (
                <div className="space-y-4">
                  {currentClass.classStudents.map((student) => (
                    <div key={student.student.accountId} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarImage src={student.student.imgUrl} alt={student.name} />
                          <AvatarFallback>{student.student.fullName?.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{student.student.fullName}</div>
                          <div className="text-sm text-muted-foreground">{student.student.email}</div>
                        </div>
                      </div>
                      <div className="hidden md:flex flex-col text-sm">
                        <div>Phone: {student.student.phoneNumber || "N/A"}</div>
                        <div>DOB: {student.student.dob ? format(new Date(student.student.dob), "dd/MM/yyyy") : "N/A"}</div>
                      </div>
                      <Link to={`/officer/student/detail?studentId=${student.student.accountId}`}>
                        <Button variant="outline" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-10">No students in class</div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
