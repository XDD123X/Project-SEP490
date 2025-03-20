import { DialogFooter } from "@/components/ui/dialog";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { getLecturerList } from "@/services/accountService";
import { getAllCourse } from "@/services/courseService";
import { getCurrentSetting } from "@/services/classSettingService";
import { useNavigate } from "react-router-dom";
import { AddClass } from "@/services/classService";

// Form schema with validation
const formSchema = z.object({
  classCode: z.string().min(3, "Class code must be at least 3 characters"),
  className: z.string().min(3, "Class name must be at least 3 characters"),
  lecturerId: z.string().min(1, "Please select a lecturer"),
  courseId: z.coerce.number().min(1, "Please select a course"),
  totalSession: z.coerce.number(),
  startDate: z
    .string()
    .datetime({ required_error: "Start date is required" })
    .refine(
      (date) => {
        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return selectedDate >= today;
      },
      { message: "Start date cannot be in the past" }
    ),
  endDate: z.string().datetime().nullable().optional(),
  classUrl: z.string(),
  status: z.coerce.number(),
});

// Confirmation Dialog Component
function ConfirmationDialog({ open, onClose, onConfirm, data, lecturerName, course, classCodeExist }) {
  // Find the lecturer and course names based on their IDs

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Class Creation</DialogTitle>
          <DialogDescription>Please review the class information before confirming.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className={`font-medium ${classCodeExist === true ? "text-red-500" : ""}`}>Class Code:</div>
            <div className={`${classCodeExist === true ? "text-red-500" : ""}`}>
              {data.classCode}
              <p className={classCodeExist === true ? "font-bold" : "hidden"}>( Class Code Already Exists )</p>
            </div>

            <div className="font-medium">Class Name:</div>
            <div>{data.className}</div>

            <div className="font-medium">Lecturer:</div>
            <div>{lecturerName}</div>

            <div className="font-medium">Course:</div>
            <div>
              {course.courseName} - {course.description}
            </div>

            <div className="font-medium">Total Sessions:</div>
            <div>{data.totalSession}</div>

            <div className="font-medium">Start Date:</div>
            <div>{format(data.startDate, "dd/MM/yyy")}</div>

            <div className="font-medium">End Date:</div>
            <div>{data.endDate ? format(data.endDate, "dd/MM/yyy") : "Not specified"}</div>

            <div className="font-medium">Class URL:</div>
            <div className="truncate">{data.classUrl}</div>

            <div className="font-medium">Status:</div>
            <div>{data.status === 0 ? "Upcoming" : "Studying"}</div>
          </div>
        </div>
        <DialogFooter className="flex space-x-2 sm:justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function ClassFormPage() {
  const [lecturers, setLecturers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [classSetting, setClassSetting] = useState({ sessionTotal: 0 });
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [formData, setFormData] = useState(null);
  const [classCodeExist, setClassCodeExist] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const lecList = await getLecturerList();
        const courseList = await getAllCourse();
        const currentSetting = await getCurrentSetting();

        setLecturers(lecList.data);
        setCourses(courseList.data);
        setClassSetting(currentSetting.data);
      } catch (error) {
        toast.error(error);
      }
    };
    fetchData();
  }, []);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      classCode: "",
      className: "",
      lecturerId: "",
      courseId: "",
      totalSession: classSetting.sessionTotal || 0,
      classUrl: "",
      status: 1, // ✅ Để số thay vì string
      startDate: new Date().toISOString(), // ✅ Fix lỗi startDate
      endDate: null,
    },
  });

  // Watch lecturer changes to update classUrl
  const watchLecturer = form.watch("lecturer");

  useEffect(() => {
    if (classSetting.sessionTotal) {
      form.setValue("totalSession", classSetting.sessionTotal);
    }

    if (watchLecturer) {
      const selectedLecturer = lecturers.find((l) => l.accountId === watchLecturer);
      if (selectedLecturer) {
        form.setValue("classUrl", selectedLecturer.meetUrl);
      }
    }
  }, [watchLecturer, form, lecturers, classSetting]);

  function onSubmit(data) {
    setClassCodeExist(false);
    setFormData(data);
    setShowConfirmation(true);
  }

  async function handleConfirm() {
    try {
      const result = await AddClass(formData); // Gửi dữ liệu lên API
      if (result.status === 200) {
        toast.success("Class created successfully! 🎉");
        navigate(`/officer/class/detail?classId=${result.data.classId}`);
      } else if (result.status === 409) {
        setClassCodeExist(true);
        toast.error("Class code already exists! 🚨");
      } else {
        toast.error("Something went wrong! ❌");
      }
    } catch (error) {
      toast.error("Unexpected error! ❌");
      console.error(error);
    }
  }

  return (
    <main className="container mx-auto py-10 px-4">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Create New Class</CardTitle>
          <CardDescription>Fill in the details to create a new class</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-6">
                {/* First row: classCode and className */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="classCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Class Code</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter class code" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="className"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Class Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter class name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Second row: lecturer and course */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="lecturerId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lecturer</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            const selectedLecturer = lecturers.find((l) => l.accountId === value);
                            if (selectedLecturer) {
                              form.setValue("classUrl", selectedLecturer.meetUrl);
                            }
                          }}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select lecturer" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {lecturers.map((lecturer) => (
                              <SelectItem key={lecturer.accountId} value={lecturer.accountId.toString()}>
                                {lecturer.gender === false ? 'Ms.' : 'Mr.'} {lecturer.fullName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="courseId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Course</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select course" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {courses.map((course) => (
                              <SelectItem key={course.courseId} value={course.courseId.toString()}>
                                {course.courseName} - {course.description}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Third row: totalSession and status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="totalSession"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Sessions</FormLabel>
                        <FormControl>
                          <Input type="number" disabled value={classSetting?.sessionTotal ?? "-"} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(Number(value))} // Chuyển đổi thành số
                          value={field.value?.toString()} // Chuyển thành chuỗi để tránh lỗi
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1">Upcoming</SelectItem>
                            <SelectItem value="2">Studying</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Fourth row: startDate and classUrl */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Start Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                {field.value ? format(new Date(field.value), "dd/MM/yyy") : <span>Pick a date</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={field.value ? new Date(field.value) : undefined} onSelect={(date) => field.onChange(date?.toISOString())} initialFocus />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="classUrl"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Class URL</FormLabel>
                        <FormControl>
                          <Input disabled {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Fifth row: endDate only */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>End Date (Optional)</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={field.value || undefined} onSelect={(date) => field.onChange(date?.toISOString())} initialFocus />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div></div> {/* Empty div to maintain grid alignment */}
                </div>
              </div>

              <CardFooter className="px-0 pt-6">
                <Button type="submit" className="ml-auto">
                  Create New Class
                </Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>

      {showConfirmation && formData && (
        <ConfirmationDialog
          open={showConfirmation}
          onClose={() => setShowConfirmation(false)}
          onConfirm={handleConfirm}
          data={formData}
          lecturerName={lecturers.find((l) => l.accountId === formData.lecturerId)?.fullName || "Unknown Lecturer"}
          course={courses.find((c) => c.courseId === formData.courseId) || null}
          classCodeExist={classCodeExist}
        />
      )}
    </main>
  );
}
