import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, Settings } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/services/StoreContext";
import { useNavigate } from "react-router-dom";

export default function AddCourseForm({ course, isEditing = false, onSave, onCancel, setIsCheckingStatus }) {
  const { state } = useStore();
  const navigate = useNavigate();
  const { user } = state;
  const uid = user.uid;
  const [formData, setFormData] = useState({
    courseName: "",
    description: "",
    status: 1,
  });

  useEffect(() => {
    if (course && isEditing) {
      setFormData({
        courseId: course.courseId,
        courseName: course.courseName,
        description: course.description,
        status: course.status,
      });
    } else {
      setFormData({
        courseName: "",
        description: "",
        createdBy: uid,
      });
    }
  }, [course, isEditing]);

  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleSubmit = () => {
    if (!formData.courseName || !formData.description) {
      toast.error("Please fill in all required fields");
      return;
    }
    onSave(formData);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="courseName">Course Name</Label>
        <Input id="courseName" value={formData.courseName || ""} onChange={(e) => handleChange("courseName", e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" value={formData.description || ""} onChange={(e) => handleChange("description", e.target.value)} className="min-h-[100px]" />
      </div>

      {isEditing && (
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <div className="flex items-center gap-2">
            <Select value={formData.status?.toString()} onValueChange={(value) => handleChange("status", Number.parseInt(value))} disabled className="w-full">
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Cancelled</SelectItem>
                <SelectItem value="1">Active</SelectItem>
                <SelectItem value="2">Pending</SelectItem>
                <SelectItem value="3">Obsolete</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={() => setIsCheckingStatus(true)}>
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={() => navigate(-1)}>
          Cancel
        </Button>
        <Button onClick={handleSubmit}>{isEditing ? "Save Changes" : "Add Course"}</Button>
      </div>
    </div>
  );
}
