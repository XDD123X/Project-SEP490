import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Eye, Edit, X, Check, Clock } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { getCourses } from "@/data/demoCourseData";
import { canEditCourses } from "@/data/demoCourseState";


export default function ViewCourseListpage() {
    const [courses, setCourses] = useState([]);
    const navigate = useNavigate()

    useEffect(() => {
        // Get courses from our mock data service
        const courseData = getCourses();
        setCourses(courseData);
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

    const getStatusBadge = (status) => {
        switch (status) {
            case 0:
                return <Badge variant="destructive">
                    <X className="w-4 h-4 mr-2" />
                    Cancelled
                </Badge>;
            case 1:
                return <Badge variant="success" className="bg-green-500 hover:bg-green-600">
                    <Check className="w-4 h-4 mr-2" />Active
                </Badge>;
            case 2:
                return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
                    <Clock className="w-4 h-4 mr-2" />
                    Pending
                </Badge>;
            default:
                return <Badge variant="outline">Unknown</Badge>;
        }
    };

    return (
        <main className="container mx-auto py-8" >
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
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b bg-muted/50 font-medium">
                                    <th className="py-3 px-4 text-left">ID</th>
                                    <th className="py-3 px-4 text-left">Course Name</th>
                                    <th className="py-3 px-4 text-left">Description</th>
                                    <th className="py-3 px-4 text-left">Created By</th>
                                    <th className="py-3 px-4 text-left">Created At</th>
                                    <th className="py-3 px-4 text-left">Status</th>
                                    <th className="py-3 px-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {courses.map((course) => (
                                    <tr key={course.courseId} className="border-b">
                                        <td className="py-3 px-4">{course.courseId}</td>
                                        <td className="py-3 px-4 font-medium">{course.courseName}</td>
                                        <td className="py-3 px-4">{course.description}</td>
                                        <td className="py-3 px-4">
                                            {course.createdByNavigation?.fullName || "Unknown"}
                                        </td>
                                        <td className="py-3 px-4">
                                            {new Date(course.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="py-3 px-4">
                                            {getStatusBadge(course.status)}
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex justify-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => handleViewCourse(course.courseId)}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>

                                                {canEditCourses() && (
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() => handleEditCourse(course.courseId)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {courses.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="py-6 text-center text-muted-foreground">
                                            No courses found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </main >
    );
}
