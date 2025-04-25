import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Eye, Flag, FlagOff, TriangleAlert } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { GetLecturerClassById, TogglClassStudentStatus } from "@/services/classService";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ClassBadge } from "@/components/BadgeComponent";
import { toast } from "sonner";

export default function ViewClassDetailLecturerPage() {
  const { id } = useParams();
  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  //Valid id
  useEffect(() => {
    if (!id) {
      navigate("/lecturer/class", { replace: true });
    }
  }, [id, navigate]);

  //fetch function
  const fetchClassDetail = async () => {
    try {
      const response = await GetLecturerClassById(id);
      console.log(response.data);

      if (response.status === 200 && response.data != null) {
        setClassData(response.data);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching class details:", error);
      setLoading(false);
    }
  };

  // Simulate API fetch
  useEffect(() => {
    fetchClassDetail();
  }, [id]);

  const handleChangeClassStudentStatus = async (classId, studentId) => {
    try {
      const response = await TogglClassStudentStatus(classId, studentId);
      if (response.status === 200) {
        fetchClassDetail();
        toast.success("Student In Class Status Changed Successfully");
      }
    } catch (error) {
      console.log(error);
      toast.error("Student Status Change Failed");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-primary border-solid rounded-full border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Class not found</h1>
          <Button asChild>
            <Link to="/lecturer/my-class">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Classes
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Button asChild variant="outline">
          <Link to="/lecturer/my-class">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Classes
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Class Details</CardTitle>
              <CardDescription>Information about the current class</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="font-semibold">Class Code:</div>
                  <div>{classData.classCode}</div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="font-semibold">Class Name:</div>
                  <div>{classData.className}</div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="font-semibold">Course:</div>
                  <div>{classData.course.courseName}</div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="font-semibold">Description:</div>
                  <div>{classData.course.description}</div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="font-semibold">Lecturer:</div>
                  <div>
                    {classData.lecturer.gender ? "Mr." : "Ms."} {classData.lecturer.fullName}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="font-semibold">Start Date:</div>
                  <div>{classData?.startDate ? format(new Date(classData.startDate), "dd/MM/yyyy") : "TBD"}</div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="font-semibold">End Date:</div>
                  <div>{classData?.endDate ? format(new Date(classData.endDate), "dd/MM/yyyy") : "TBD"}</div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="font-semibold">Total Sessions:</div>
                  <div>{classData.totalSession}</div>
                </div>

                <div className="grid grid-cols-2 gap-2 items-center">
                  <div className="font-semibold">Meet URL:</div>
                  <div className="truncate max-w-[200px]">
                    <Link
                      className="underline underline-offset-4 text-blue-500 block truncate"
                      to={classData.lecturer?.meetUrl || "#"}
                      {...(classData.lecturer?.meetUrl ? { target: "_blank" } : {})}
                      title={classData.lecturer?.meetUrl || "N/A"} // Hiển thị full URL khi hover
                    >
                      {classData.lecturer?.meetUrl ? classData.lecturer.meetUrl.split("/").pop() : "N/A"}
                    </Link>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="font-semibold">Status:</div>
                  <div>
                    <ClassBadge status={classData.status} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Students ({classData.classStudents.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4">
                {classData?.classStudents?.length > 0 ? (
                  <div className="space-y-4">
                    {classData.classStudents.map((student) => (
                      <div
                        key={student.student.accountId}
                        className={`flex items-center justify-between p-3 border rounded-lg
                        ${student.status === 1 ? "" : "border-yellow-500"}`}
                      >
                        <div className="flex items-center space-x-4">
                          <Avatar>
                            <AvatarImage src={student.student.imgUrl} alt={student.name} />
                            <AvatarFallback>{student.student.fullName?.substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2 font-medium"> {student.student.fullName} {student.status === 0 && (<TriangleAlert className="w-4 h-4 text-yellow-500"/>)} </div>
                            <div className="text-sm text-muted-foreground">{student.student.email}</div>
                          </div>
                        </div>
                        <div className="hidden md:flex flex-col text-sm">
                          <div>Phone: {student.student.phoneNumber || "N/A"}</div>
                          <div>DOB: {student.student.dob ? format(new Date(student.student.dob), "dd/MM/yyyy") : "N/A"}</div>
                        </div>
                        <div className="flex gap-2">
                          <Link to={`/account/${student.student.accountId}`}>
                            <Button variant="outline" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button variant="outline" size="icon" onClick={() => handleChangeClassStudentStatus(student.classId, student.studentId)}>
                            {student.status !== 1 ? <FlagOff className="h-4 w-4 text-yellow-500" /> : <TriangleAlert className="h-4 w-4 text-red-500" />}
                          </Button>
                        </div>
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
    </div>
  );
}
