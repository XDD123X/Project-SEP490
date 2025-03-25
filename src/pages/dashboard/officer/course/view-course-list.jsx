import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Eye, Edit, X, Check, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { canEditCourses } from "@/data/demoCourseState";
import { format } from "date-fns";
import { getCoursesOfficer } from "@/services/courseService";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CourseBadge } from "@/components/BadgeComponent";

export default function ViewCourseListpage() {
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const response = await getCoursesOfficer();
      if (response.status === 200 && response.data != null) {
        setCourses(response.data);
      }
    };
    fetchData();
  }, []);

  const handleAddCourse = () => {
    navigate("/officer/course/add");
  };

  const handleViewCourse = (courseId) => {
    navigate(`/officer/course/detail/${courseId}`);
  };

  const handleEditCourse = (courseId) => {
    navigate(`/officer/course/edit/${courseId}`);
  };

  return (
    <main className="container mx-auto py-8">
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Course Management</CardTitle>
          </div>
          {canEditCourses() && (
            <Button onClick={handleAddCourse}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Course
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table className="w-full text-sm">
              <TableHeader>
                <TableRow className="border-b bg-muted/50 font-medium">
                  <TableHead className="py-3 px-4 text-left">#</TableHead>
                  <TableHead className="py-3 px-4 text-left">Course Name</TableHead>
                  <TableHead className="py-3 px-4 text-left">Description</TableHead>
                  <TableHead className="py-3 px-4 text-left">Created By</TableHead>
                  <TableHead className="py-3 px-4 text-left">Created At</TableHead>
                  <TableHead className="py-3 px-4 text-left">Status</TableHead>
                  <TableHead className="py-3 px-4 text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.map((course, index) => (
                  <TableRow key={course.courseId} className="border-b">
                    <TableCell className="py-3 px-4">{index + 1}</TableCell>
                    <TableCell className="py-3 px-4 font-medium">{course.courseName}</TableCell>
                    <TableCell className="py-3 px-4">{course.description}</TableCell>
                    <TableCell className="py-3 px-4">
                      {course.createdByNavigation?.role.name || ""} {""}
                      {course.createdByNavigation?.fullName || "-"}
                    </TableCell>
                    <TableCell className="py-3 px-4">{format(course.createdAt, "dd/MM/yyyy")}</TableCell>
                    <TableCell className="py-3 px-4">
                      <CourseBadge status={course.status} />
                    </TableCell>
                    <TableCell className="py-3 px-4">
                      <div className="flex justify-center gap-2">
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleViewCourse(course.courseId)}>
                          <Eye className="h-4 w-4" />
                        </Button>

                        {canEditCourses() && (
                          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleEditCourse(course.courseId)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {courses.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="py-6 text-center text-muted-foreground">
                      No courses found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
