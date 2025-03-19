import React from "react";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Pencil, Save, Wrench } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { GetClassById, UpdateClass } from "@/services/classService";
import { getLecturerList } from "@/services/accountService";
import { getAllCourse } from "@/services/courseService";

export default function ClassEditPage() {
  const [searchParams] = useSearchParams();
  const [lecturers, setLecturers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedLecturer, setSelectedLecturer] = useState();
  const [editLecturer, setEditLecturer] = useState(false);
  const classId = searchParams.get("classId") || "";
  const navigate = useNavigate();

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
            setSelectedLecturer(classData.data.lecturer);
          }
          if (lecturerData.status === 200 && lecturerData.data != null) {
            setLecturers(lecturerData.data);
          }
          if (courseData.status === 200 && courseData.data != null) {
            setCourses(courseData.data);
          }
        } catch (error) {
          toast.error("Error fetching class data");
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
      const lecturer = lecturers.find((l) => l.accountId === value);
      setSelectedLecturer(lecturer);
    }
  };

  const handleCheckTotalSession = () => {
    setClassItem((prev) => ({ ...prev, totalSession: 5 }));
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
        classUrl: classItem.classUrl,
        scheduled: classItem.scheduled,
        status: classItem.status,
      };

      // console.log(classItem);
      //console.log("Saving class data:", JSON.stringify(updatedClass, null, 2));

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading class information...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6 text-center">Class Edit</h1>
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center text-xl">Code: {classItem.classCode}</CardTitle>
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
                <Select value={classItem.lecturer.accountId} onValueChange={(value) => handleSelectChange("lecturerId", value)} disabled={!editLecturer}>
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
                <Button variant="outline" size="icon" onClick={handleCheckTotalSession} title="Check total sessions">
                  <Wrench className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Status - Select */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={classItem.status.toString()} onValueChange={(value) => handleSelectChange("status", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Disabled</SelectItem>
                  <SelectItem value="1">Upcoming</SelectItem>
                  <SelectItem value="2">Studying</SelectItem>
                  <SelectItem value="2">Finished</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Start Date */}
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !classItem.startDate && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {classItem.startDate ? format(new Date(classItem.startDate), "dd/MM/yyyy") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={classItem.startDate ? new Date(classItem.startDate) : undefined}
                    onSelect={(date) =>
                      date &&
                      setClassItem((prev) => ({
                        ...prev,
                        startDate: date.toISOString().split("T")[0],
                      }))
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !classItem.endDate && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {classItem.endDate ? format(new Date(classItem.endDate), "dd/MM/yyyy") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={classItem.endDate ? new Date(classItem.endDate) : undefined}
                    onSelect={(date) =>
                      date &&
                      setClassItem((prev) => ({
                        ...prev,
                        endDate: date.toISOString().split("T")[0],
                      }))
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Class URL - Disabled */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="classUrl">Class URL</Label>
              <Input id="classUrl" name="classUrl" value={selectedLecturer.meetUrl} disabled />
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
    </div>
  );
}
