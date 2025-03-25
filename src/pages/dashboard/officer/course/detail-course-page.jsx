import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { canEditCourses } from "@/data/demoCourseState";
import { toast } from "sonner";
import { getCourseByIdOfficer } from "@/services/courseService";
import { CourseBadge } from "@/components/BadgeComponent";

export default function CourseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const courseId = id;
  const [course, setCourse] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (courseId) {
        try {
          const respose = await getCourseByIdOfficer(courseId);
          if (respose.status === 200 && respose.data != null) {
            setCourse(respose.data);
          }
        } catch (error) {
          toast.error(error);
        }
      }
    };
    fetchData();
  }, [courseId]);

  const handleEditCourse = () => {
    navigate(`/officer/course/edit/${courseId}`);
  };

  if (!course) {
    return (
      <main className="container mx-auto py-8">
        <Card className="w-full max-w-3xl mx-auto">
          <CardContent className="py-10 text-center">Loading course details...</CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="container mx-auto py-8">
      <Card className="w-full max-w-3xl mx-auto">
        <div className="flex justify-between items-center p-4">
          <Button variant="outline" onClick={() => navigate("/officer/course")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          {canEditCourses() && (
            <Button onClick={handleEditCourse}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          )}
        </div>

        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-4">
            <CardTitle>Course Details</CardTitle>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Course Name</h3>
                <p className="text-lg font-medium">{course.courseName}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Created At</h3>
                <p className="text-lg">{new Date(course.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Last Updated</h3>
                <p className="text-lg">{course.updatedAt ? new Date(course.updatedAt).toLocaleDateString() : "Never"}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                <p className="mt-1 text-lg">{course.description}</p>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
              <div className="flex items-center gap-2 mt-1">
                <CourseBadge status={course.status} />
              </div>
            </div>

            {course.createdByNavigation && (
              <div className="mt-6 border-t pt-6">
                <h3 className="text-md font-medium mb-2">Created By</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Name</h4>
                    <p>{course.createdByNavigation.fullName}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Email</h4>
                    <p>{course.createdByNavigation.email}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Phone</h4>
                    <p>{course.createdByNavigation.phoneNumber}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Role</h4>
                    <p>{course.createdByNavigation.role?.name || "Unknown"}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
