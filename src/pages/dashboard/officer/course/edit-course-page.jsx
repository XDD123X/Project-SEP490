import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Trash2, AlertCircle } from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"
import { canEditCourses } from "@/data/demoCourseState"
import StatusCheck from "@/components/course/status-check"
import { getCourseById, updateCourse } from "@/data/demoCourseData"
import AddCourseForm from "@/components/course/course-form"

export default function CourseEditPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const courseId = Number.parseInt(id)

    const [course, setCourse] = useState(null)
    const [isCheckingStatus, setIsCheckingStatus] = useState(false)

    useEffect(() => {
        if (courseId) {
            const courseData = getCourseById(courseId)
            setCourse(courseData)
        }
    }, [courseId])

    useEffect(() => {
        // Redirect if user doesn't have edit permissions
        if (!canEditCourses()) {
            navigate(`/officer/course/detail/${courseId}`)
        }
    }, [courseId, navigate])

    const handleStatusChange = (newStatus) => {
        if (course) {
            const updatedCourse = updateCourse(course.courseId, { ...course, status: newStatus })
            setCourse(updatedCourse)
            setIsCheckingStatus(false)
        }
    }

    const handleSaveEdit = (updatedCourse) => {
        // Update the course
        const updated = updateCourse(course.courseId, {
            ...course,
            courseName: updatedCourse.courseName,
            description: updatedCourse.description,
            status: updatedCourse.status,
        })

        setCourse(updated)
        navigate(`/officer/course/detail/${courseId}`)
    }

    const handleDeleteCourse = () => {
        if (course && course.status === 0) {
            // In a real app, you would call an API to delete the course
            console.log("Course deleted:", course)
            navigate("/officer/course")
        }
    }

    if (!course) {
        return (
            <main className="container mx-auto py-8">
                <Card className="w-full max-w-3xl mx-auto">
                    <CardContent className="py-10 text-center">Loading course details...</CardContent>
                </Card>
            </main>
        )
    }

    return (
        <main className="container mx-auto py-8">
            <Card className="w-full max-w-3xl mx-auto">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" onClick={() => navigate(`/officer/course/detail/${courseId}`)}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <CardTitle>Edit Course</CardTitle>
                    </div>
                    <Button variant="destructive" onClick={handleDeleteCourse} disabled={course.status !== 0}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Course
                    </Button>
                </CardHeader>

                <CardContent>
                    {isCheckingStatus ? (
                        <StatusCheck
                            course={course}
                            onStatusChange={handleStatusChange}
                            onCancel={() => setIsCheckingStatus(false)}
                        />
                    ) : (
                        <>
                            <AddCourseForm
                                course={course}
                                isEditing={true}
                                onSave={handleSaveEdit}
                                onCancel={() => navigate(`/officer/course/detail/${courseId}`)}
                            />

                            <div className="mt-6 pt-6 border-t">
                                <Button variant="outline" className="w-full" onClick={() => setIsCheckingStatus(true)}>
                                    <AlertCircle className="mr-2 h-4 w-4" />
                                    Check Course Status
                                </Button>
                                <p className="text-sm text-muted-foreground mt-2">
                                    Check if this course is currently in use before changing its status.
                                </p>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </main>
    )
}

