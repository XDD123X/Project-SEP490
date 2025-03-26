import AddCourseForm from "@/components/course/course-form";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { addCourseOfficer } from "@/services/courseService";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function AddCoursePage() {
  const navigate = useNavigate();

  const handleAddCourse = async (courseData) => {
    try {
      const response = await addCourseOfficer(courseData);

      if (response?.status === 200) {
        toast.success("Course added successfully!");
        navigate("/officer/course");
      } else {
        toast.error(response?.message || "Failed to add course.");
      }
    } catch (error) {
      console.error("Error adding course:", error);
      toast.error("Unexpected error occurred!");
    }
  };

  return (
    <main className="container mx-auto py-8">
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Add New Course</CardTitle>
        </CardHeader>
        <CardContent>
          <AddCourseForm onSave={handleAddCourse} onCancel={() => navigate("/officer/course")} />
        </CardContent>
      </Card>
    </main>
  );
}
