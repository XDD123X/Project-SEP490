import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, Upload } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { RichTextEditor } from "./rich-text-editor";
import { getRoleList } from "@/services/roleService";
import { getAllCourse } from "@/services/courseService";
import { GetClassList } from "@/services/classService";
import { toast } from "sonner";
import { AddNotification } from "@/services/notificationService";

export default function AddNotificationPage() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [roles, setRoles] = useState([]);
  const [classes, setClasses] = useState([]);
  const [notificationType, setNotificationType] = useState("0");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [errors, setErrors] = useState({});

  //fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const roleList = await getRoleList();
        const classList = await GetClassList();
        const courseList = await getAllCourse();

        if (roleList.status === 200 || classList.status === 200 || courseList.status === 200) {
          setRoles(roleList.data);
          setClasses(classList.data);
          setCourses(courseList.data);
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, []);

  const handleSelectClass = (value) => {
    console.log("Selected class:", value);
    setSelectedClass(value);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    let newErrors = {};

    //valid form
    if (notificationType === "1" && (!selectedRole || selectedRole.trim() === "")) {
      newErrors.selectedRole = "Please select a role";
    }
    if (notificationType === "2" && (!selectedCourse || selectedCourse.trim() === "")) {
      newErrors.selectedCourse = "Please select a course";
    }
    if (notificationType === "3" && (!selectedClass || selectedClass.trim() === "")) {
      newErrors.selectedClass = "Please select a class";
    }

    // Kiểm tra content (RichTextEditor)
    if (!content.trim()) {
      newErrors.content = "Content is required";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length !== 0) {
      toast.warning("Please Fill All Required Field");
    }

    let notificationData = {
      title,
      content,
      type: Number.parseInt(notificationType),
    };

    switch (notificationData.type) {
      case 0:
        notificationData.value = "";
        break;
      case 1:
        notificationData.value = selectedRole.toLowerCase();
        break;
      case 2:
        notificationData.value = selectedCourse.toLowerCase();
        break;
      case 3:
        notificationData.value = selectedClass.toLowerCase();
        break;
      default:
        break;
    }

    console.log("Notification data:", notificationData);

    try {
      const response = await AddNotification(notificationData);
      console.log(response);
      
      if (response.status === 200) {
        toast.success("Notification Created Successfully!");
        // navigate("/notification/list");
      }
    } catch (error) {
      toast.error(error);
    }

    // Redirect back to notifications page
    // navigate("/notification/list");
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Add Notification</h1>
        <Button variant="outline" asChild>
          <Link to="/notification/list">Back to Notifications</Link>
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Create New Notification</CardTitle>
            <CardDescription>Fill in the details below to create a new notification.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Notification Type */}
            <div className="space-y-2">
              <Label htmlFor="notification-type">Notification Type</Label>
              <Select value={notificationType} onValueChange={setNotificationType}>
                <SelectTrigger id="notification-type">
                  <SelectValue placeholder="Select notification type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">All</SelectItem>
                  <SelectItem value="1">Role</SelectItem>
                  <SelectItem value="2">Course</SelectItem>
                  <SelectItem value="3">Class</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Role Selection */}
            {notificationType === "1" && (
              <div className="space-y-2">
                <Label htmlFor="role">Select Role</Label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role, index) => (
                      <SelectItem key={index} value={role.toString()}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.selectedRole && <p className="text-red-500 text-sm">{errors.selectedRole}</p>}
              </div>
            )}

            {/* Course Selection */}
            {notificationType === "2" && (
              <div className="space-y-2">
                <Label htmlFor="course">Select Course</Label>
                <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                  <SelectTrigger id="course">
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.courseId} value={course.courseName.toString()}>
                        {course.courseName} - {course.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.selectedCourse && <p className="text-red-500 text-sm">{errors.selectedCourse}</p>}
              </div>
            )}

            {/* Class Selection (if class type is selected) */}
            {notificationType === "3" && (
              <div className="space-y-2">
                <Label htmlFor="class">Select Class</Label>
                <Select value={selectedClass} onValueChange={handleSelectClass}>
                  <SelectTrigger id="class" className="border border-gray-300 rounded-md px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500">
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((classItem) => (
                      <SelectItem key={classItem.classId} value={classItem.classCode.toString()}>
                        {classItem.classCode} - {classItem.className}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.selectedClass && <p className="text-red-500 text-sm">{errors.selectedClass}</p>}
              </div>
            )}

            {/* Notification Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter notification title" required />
            </div>

            {/* Notification Content */}
            <div className="space-y-2">
              <Label htmlFor="content" className="flex items-center justify-between w-full">
                <span className={errors.content && "text-red-500"}>Content</span>
                {errors.content && <p className="text-red-500 text-xs">( {errors.content} )</p>}
              </Label>

              <RichTextEditor value={content} onChange={setContent} placeholder="Enter notification content (supports rich text formatting)" minHeight="200px" />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button type="submit">Create Notification</Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
