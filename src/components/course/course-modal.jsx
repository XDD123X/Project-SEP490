import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function CourseModal({ isOpen, onClose, onSave, course, isEditing }) {
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
                createdBy: course.createdBy,
                createdAt: course.createdAt,
                updatedAt: course.updatedAt,
                createdByNavigation: course.createdByNavigation,
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
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Edit Course" : "Add New Course"}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="courseName" className="text-right">
                            Course Name
                        </Label>
                        <Input
                            id="courseName"
                            value={formData.courseName || ""}
                            onChange={(e) => handleChange("courseName", e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="description" className="text-right">
                            Description
                        </Label>
                        <Textarea
                            id="description"
                            value={formData.description || ""}
                            onChange={(e) => handleChange("description", e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                    {isEditing && (
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="status" className="text-right">
                                Status
                            </Label>
                            <Select
                                value={formData.status?.toString()}
                                onValueChange={(value) => handleChange("status", Number.parseInt(value))}
                            >
                                <SelectTrigger className="col-span-3">
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
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit}>{isEditing ? "Save Changes" : "Add Course"}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

