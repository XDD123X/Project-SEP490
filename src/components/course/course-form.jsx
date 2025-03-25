import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"


export default function AddCourseForm({ course, isEditing = false, onSave, onCancel }) {
    const [formData, setFormData] = useState({
        courseName: "",
        description: "",
        status: 1,
    })

    useEffect(() => {
        if (course && isEditing) {
            setFormData({
                courseId: course.courseId,
                courseName: course.courseName,
                description: course.description,
                status: course.status,
            })
        } else {
            setFormData({
                courseName: "",
                description: "",
                status: 1,
            })
        }
    }, [course, isEditing])

    const handleChange = (field, value) => {
        setFormData({
            ...formData,
            [field]: value,
        })
    }

    const handleSubmit = () => {
        if (!formData.courseName || !formData.description) {
            alert("Please fill in all required fields")
            return
        }

        onSave(formData)
    }

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="courseName">Course Name</Label>
                <Input
                    id="courseName"
                    value={formData.courseName || ""}
                    onChange={(e) => handleChange("courseName", e.target.value)}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    value={formData.description || ""}
                    onChange={(e) => handleChange("description", e.target.value)}
                    className="min-h-[100px]"
                />
            </div>

            {isEditing && (
                <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                        value={formData.status?.toString()}
                        onValueChange={(value) => handleChange("status", Number.parseInt(value))}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="0">Cancelled</SelectItem>
                            <SelectItem value="1">Active</SelectItem>
                            <SelectItem value="2">Pending</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button onClick={handleSubmit}>{isEditing ? "Save Changes" : "Add Course"}</Button>
            </div>
        </div>
    )
}

