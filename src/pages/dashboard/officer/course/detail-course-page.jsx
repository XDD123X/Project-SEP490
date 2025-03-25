import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit } from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"
import { getCourseById } from "@/data/demoCourseData"
import { canEditCourses } from "@/data/demoCourseState"

export default function CourseDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const courseId = Number.parseInt(id)

    const [course, setCourse] = useState(null)

    useEffect(() => {
        if (courseId) {
            const courseData = getCourseById(courseId)
            setCourse(courseData)
        }
    }, [courseId])

    const handleEditCourse = () => {
        navigate(`/officer/course/edit/${courseId}`)
    }

    const getStatusBadge = (status) => {
        switch (status) {
            case 0:
                return <Badge variant="destructive">Cancelled</Badge>
            case 1:
                return (
                    <Badge variant="success" className="bg-green-500 hover:bg-green-600">
                        Active
                    </Badge>
                )
            case 2:
                return (
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
                        Pending
                    </Badge>
                )
            default:
                return <Badge variant="outline">Unknown</Badge>
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
                        <Button variant="outline" size="icon" onClick={() => navigate("/officer/course")}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <CardTitle>Course Details</CardTitle>
                    </div>
                    {canEditCourses() && (
                        <Button onClick={handleEditCourse}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Course
                        </Button>
                    )}
                </CardHeader>

                <CardContent>
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Course ID</h3>
                                <p className="text-lg">{course.courseId}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                                <div className="flex items-center gap-2 mt-1">{getStatusBadge(course.status)}</div>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Course Name</h3>
                                <p className="text-lg font-medium">{course.courseName}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Created By</h3>
                                <p className="text-lg">{course.createdByNavigation?.fullName || "Unknown"}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Created At</h3>
                                <p className="text-lg">{new Date(course.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Last Updated</h3>
                                <p className="text-lg">
                                    {course.updatedAt ? new Date(course.updatedAt).toLocaleDateString() : "Never"}
                                </p>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                            <p className="mt-1 text-lg">{course.description}</p>
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
                                        <p>{course.createdByNavigation.Role?.name || "Unknown"}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </main>
    )
}

