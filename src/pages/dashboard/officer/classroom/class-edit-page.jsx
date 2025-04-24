import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Pencil, Save, Trash2, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { GetClassById, UpdateClass } from "@/services/classService";
import { getLecturerList } from "@/services/accountService";
import { getAllCourse } from "@/services/courseService";
import CalendarSelector from "@/components/CalendarSelector";
import { ClassBadge } from "@/components/BadgeComponent";

export default function ClassEditPage() {
  const [searchParams] = useSearchParams();
  const [lecturers, setLecturers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedLecturer, setSelectedLecturer] = useState();
  const [meetUrl, setMeetUrl] = useState("");
  const [editLecturer, setEditLecturer] = useState(false);
  const classId = searchParams.get("classId") || "";
  const navigate = useNavigate();
  const [tempStatus, setTempStatus] = useState("0");

  const [classItem, setClassItem] = useState({
    classId: "",
    classCode: "",
    className: "",
    lecturerId: "",
    courseId: "",
    totalSession: 0,
    startDate: "",
    endDate: "",
    classUrl: "",
    scheduled: false,
    status: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [showScheduledDialog, setShowScheduledDialog] = useState(false);
  const [showEditLecturerDialog, setShowEditLecturerDialog] = useState(false);
  const [showDeleteClassDialog, setShowDeleteClassDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch class data
  useEffect(() => {
    const fetchData = async () => {
      if (classId) {
        setIsLoading(true); // Cần reset loading trước khi fetch
        try {
          const classData = await GetClassById(classId);
          const lecturerData = await getLecturerList();
          const courseData = await getAllCourse();

          if (classData.status === 200 && classData.data != null) {
            setClassItem(classData.data);
            if (classData.data.lecturer) {
              setSelectedLecturer(classData.data.lecturer.accountId);
              setMeetUrl(classData.data.lecturer.meetUrl);
            }

            setTempStatus(classData.data.status);
          }
          if (lecturerData.status === 200 && lecturerData.data != null) {
            setLecturers(lecturerData.data);
          }
          if (courseData.status === 200 && courseData.data != null) {
            setCourses(courseData.data);
          }
        } catch (error) {
          toast.error("Error fetching class data");
          console.log(error);
        } finally {
          setIsLoading(false); // Đảm bảo tắt loading khi hoàn thành
        }
      } else {
        navigate("/404");
      }
    };
    fetchData();
  }, [classId, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setClassItem((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setClassItem((prev) => ({
      ...prev,
      [name]: name === "status" ? Number.parseInt(value) : value,
    }));

    if (name === "lecturerId") {
      const meetUrl = lecturers.filter((l) => l.accountId === value);
      setMeetUrl(meetUrl[0].meetUrl);
      setSelectedLecturer(value);
    }
  };

  const handleCheckTotalSession = () => {
    setClassItem((prev) => ({ ...prev, totalSession: 0 }));
    toast("Total sessions updated");
  };

  const toggleEditLecturer = () => {
    setEditLecturer((prev) => !prev);
    setShowEditLecturerDialog(false);
  };

  const toggleScheduled = () => {
    setClassItem((prev) => ({
      ...prev,
      scheduled: prev.scheduled === true ? false : true,
    }));
    setShowScheduledDialog(false);
  };

  const handleSave = async () => {
    try {
      const updatedClass = {
        classId: classItem.classId,
        classCode: classItem.classCode,
        className: classItem.className,
        lecturerId: classItem.lecturerId,
        courseId: classItem.courseId,
        totalSession: classItem.totalSession,
        startDate: classItem.startDate,
        endDate: classItem.endDate,
        classUrl: meetUrl,
        scheduled: classItem.scheduled,
        status: tempStatus,
      };

      try {
        const response = await UpdateClass(updatedClass);

        if (response.status === 200) {
          toast.success("Class information has been saved successfully");
        } else {
          toast.error("Update Failed");
        }
      } catch (error) {
        toast.error(error);
      }
    } catch (error) {
      console.error("Error saving class data:", error);
      toast.error("Failed to save class information");
    }
  };

  const handleStatusChange = (value) => {
    setTempStatus(value);
  };

  const handleDeleteClass = async () => {
    try {
      setIsDeleting(true);
    } catch (error) {
      console.log(error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading class information...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6 text-center">Class Infomation Update</h1>
      <div className="w-full max-w-2xl mx-auto space-y-4">
        <div className="flex justify-between mt-4">
          <Button onClick={() => navigate("/officer/class")}>
            <ChevronLeft className="mr-2 h-4 w-4" /> Back To List
          </Button>
          <Button variant="destructive" onClick={() => setShowDeleteClassDialog(true)} disabled={classItem.status !== 1}>
            <Trash2 className="ml-2 h-4 w-4" /> Delete Class
          </Button>
        </div>
        <Card className="">
          <CardHeader>
            <div className="flex justify-between mb-5 mt-2">
              <CardTitle className="text-center text-xl">Code: {classItem.classCode}</CardTitle>
              <ClassBadge status={classItem.status} />
            </div>
            <Separator />
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Class Code */}
              <div className="space-y-2">
                <Label htmlFor="classCode">Class Code</Label>
                <Input id="classCode" name="classCode" value={classItem.classCode} onChange={handleInputChange} />
              </div>

              {/* Class Name */}
              <div className="space-y-2">
                <Label htmlFor="className">Class Name</Label>
                <Input id="className" name="className" value={classItem.className} onChange={handleInputChange} />
              </div>

              {/* Course ID - Select */}
              <div className="space-y-2">
                <Label htmlFor="courseId">Course</Label>
                <Select value={classItem.courseId} onValueChange={(value) => handleSelectChange("courseId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.courseId} value={course.courseId}>
                        {course.courseName} - {course.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Lecturer ID - Select */}
              <div className="space-y-2">
                <Label htmlFor="lecturerId">Lecturer</Label>
                <div className="flex gap-2">
                  <Select
                    value={selectedLecturer} // Kiểm tra nếu lecturer tồn tại
                    onValueChange={(value) => handleSelectChange("lecturerId", value)}
                    disabled={selectedLecturer && !editLecturer}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select lecturer" />
                    </SelectTrigger>
                    <SelectContent>
                      {lecturers.map((lecturer) => (
                        <SelectItem key={lecturer.accountId} value={lecturer.accountId}>
                          {lecturer.gender ? "Mr. " : "Ms."} {lecturer.fullName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="icon" onClick={() => setShowEditLecturerDialog(true)} title="Change Lecturer">
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Total Session - With Check button */}
              <div className="space-y-2">
                <Label htmlFor="totalSession">Total Sessions</Label>
                <div className="flex gap-2">
                  <Input id="totalSession" name="totalSession" type="number" value={classItem.totalSession} disabled />
                  <Button disabled={classItem.status !== 2} variant="outline" size="icon" onClick={handleCheckTotalSession} title="Check total sessions">
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>

              {/* Status - Select */}
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={tempStatus.toString()} onValueChange={handleStatusChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="0">Inactive</SelectItem>
                    <SelectItem value="1">Upcoming</SelectItem>
                    <SelectItem value="2">Studying</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Start Date */}
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <CalendarSelector
                  className={"w-full"}
                  selectedDate={classItem.startDate ? new Date(classItem.startDate) : undefined}
                  setSelectedDate={(date) =>
                    date &&
                    setClassItem((prev) => ({
                      ...prev,
                      startDate: date.toISOString().split("T")[0],
                    }))
                  }
                />
              </div>

              {/* End Date */}
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <CalendarSelector
                  className={"w-full"}
                  selectedDate={classItem.endDate ? new Date(classItem.endDate) : undefined}
                  setSelectedDate={(date) =>
                    date &&
                    setClassItem((prev) => ({
                      ...prev,
                      endDate: date.toISOString().split("T")[0],
                    }))
                  }
                />
              </div>

              {/* Class URL - Disabled */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="classUrl">Class URL</Label>
                <Input id="classUrl" name="classUrl" value={classItem.lecturer?.meetUrl || ""} disabled />
              </div>

              {/* Scheduled - Disabled with button */}
              <div className="space-y-2">
                <Label htmlFor="scheduled">Scheduled</Label>
                <div className="flex gap-2">
                  <Select value={classItem.scheduled.toString()} disabled>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Scheduled status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="false">No</SelectItem>
                      <SelectItem value="true">Yes</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" onClick={() => setShowScheduledDialog(true)}>
                    Change
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Scheduled Confirmation Dialog */}
      <Dialog open={showScheduledDialog} onOpenChange={setShowScheduledDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Scheduled Status</DialogTitle>
            <DialogDescription>Are you sure you want to change the scheduled status of this class?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowScheduledDialog(false)}>
              Cancel
            </Button>
            <Button onClick={toggleScheduled}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* edit lecturer Confirmation Dialog */}
      <Dialog open={showEditLecturerDialog} onOpenChange={setShowEditLecturerDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Assigned Lecturer</DialogTitle>
            <DialogDescription>Are you sure you want to change the assigned lecturer of this class?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditLecturerDialog(false)}>
              Cancel
            </Button>
            <Button onClick={toggleEditLecturer}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* delete class Confirmation Dialog */}
      <Dialog open={showDeleteClassDialog} onOpenChange={setShowDeleteClassDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Class</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the class <strong>{classItem.classCode}</strong>?
              <br /> This will permanently remove all related records, files, and reports.
              <br /> This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteClassDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => handleDeleteClass()}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
