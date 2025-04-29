import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import StatusCheck from "@/components/course/status-check";
import AddCourseForm from "@/components/course/course-form";
import { deleteCourseByIdOfficer, getCourseByIdOfficer, updateCourseOfficer, updateCourseStatusOfficer } from "@/services/courseService";
import { toast } from "sonner";
import { useStore } from "@/services/StoreContext";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function CourseEditPage() {
  const [open, setOpen] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useStore();
  const { role } = state;
  const courseId = id;

  const [course, setCourse] = useState(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (courseId) {
          const response = await getCourseByIdOfficer(courseId);
          if (response.status === 200 && response.data != null) {
            setCourse(response.data);
          }
        }
      } catch (error) {
        toast.error(error);
      }
    };
    fetchData();
  }, [courseId]);

  useEffect(() => {
    // Redirect if user doesn't have edit permissions

    if (role?.toLowerCase() !== "officer" && courseId) {
      navigate(`/officer/course/detail/${courseId}`);
    }
  }, [courseId, navigate, role]);

  const handleStatusChange = async (newStatus) => {
    if (!course) return;
    const updatedCourse = { ...course, status: newStatus };
    try {
      const response = await updateCourseStatusOfficer(course.courseId, updatedCourse);

      if (response?.status === 200) {
        setCourse((prev) => ({ ...prev, status: newStatus }));
        setIsCheckingStatus(false);
        toast.success("Status updated successfully!");
      } else if (response?.status === 400) {
        toast.error("Invalid request. Please check the data.");
      } else if (response?.status === 404) {
        toast.error("Course not found.");
      } else {
        toast.error("Failed to update status.");
      }
    } catch (error) {
      toast.error("An error occurred while updating status.");
      console.error("Status update error:", error);
    }
  };

  const handleSaveEdit = async (updatedCourse) => {
    try {
      // Gọi API cập nhật khóa học
      const updated = await updateCourseOfficer(course.courseId, {
        ...course,
        courseName: updatedCourse.courseName,
        description: updatedCourse.description,
        status: updatedCourse.status,
      });

      setCourse(updated);
      toast.success("Course Updated Successfully!");
      navigate(`/officer/course/detail/${course.courseId}`);
    } catch (error) {
      console.error("Update Course Failed:", error);
      toast.error("Update Course Failed. Please Try Again!");
    }
  };

  const handleDeleteCourse = async () => {
    if (course && course.status === 0) {
      const response = await deleteCourseByIdOfficer(course.courseId);
      if (response.status === 200) {
        toast.success("Course deleted successfully");
        navigate("/officer/course");
      } else {
        toast.error(response.message);
      }
    }
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
          <Button variant="outline" onClick={() => navigate(`/officer/course/detail/${courseId}`)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          {!role?.toLowerCase() !== "officer" && (
            <Button variant="destructive" onClick={() => setOpen(true)} disabled={course.status !== 0}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          )}
        </div>
        <CardHeader className="text-center text-3xl mb-4 uppercase">
          <CardTitle>Edit Course</CardTitle>
        </CardHeader>

        <CardContent>
          {isCheckingStatus ? (
            <StatusCheck course={course} onStatusChange={handleStatusChange} onCancel={() => setIsCheckingStatus(false)} />
          ) : (
            <>
              <AddCourseForm course={course} isEditing={true} onSave={handleSaveEdit} onCancel={() => navigate(`/officer/course/detail/${courseId}`)} setIsCheckingStatus={setIsCheckingStatus} onStatusChange={handleStatusChange} />
            </>
          )}
        </CardContent>
      </Card>

      {/* Confirm Delete Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure you want to delete?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete <span className="font-bold">{course.courseName} </span>
              and remove all associated data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteCourse}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
