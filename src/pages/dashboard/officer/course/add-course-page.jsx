import AddCourseForm from "@/components/course/course-form"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { addCourse } from "@/data/demoCourseData"
import { useNavigate } from "react-router-dom"

export default function AddCoursePage() {
    const navigate = useNavigate()

    const handleAddCourse = (courseData) => {
        // Add the course
        addCourse(courseData)

        // Navigate back to course list
        navigate("/officer/course")
    }

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
    )
}

