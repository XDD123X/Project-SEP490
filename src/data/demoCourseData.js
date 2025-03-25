// Mock data for courses
const courses = [
    {
        courseId: 1,
        courseName: "IELTS",
        description: "Khóa Học IETLS 2025",
        createdBy: "6745227a-5854-436d-b07f-27e81d14fe88",
        createdAt: "2025-03-25T08:03:41.193",
        updatedAt: null,
        status: 1,
        createdByNavigation: null,
    },
    {
        courseId: 2,
        courseName: "SAT",
        description: "Khóa học SAT 2025",
        createdBy: "9af27a65-cf7e-4104-89c0-b0acc2283dca",
        createdAt: "2025-03-25T08:03:41.193",
        updatedAt: null,
        status: 1,
        createdByNavigation: {
            email: "officer1@gmail.com",
            fullName: "Nguyễn Thị Mai",
            phoneNumber: "0123123123",
            gender: false,
            Role: {
                name: "Officer",
                description: "Officer Of System",
            },
        },
    },
]

// Get all courses
export function getCourses() {
    return [...courses]
}

// Get course by ID
export function getCourseById(id) {
    return courses.find((course) => course.courseId === id) || null
}

// Add a new course
export function addCourse(courseData) {
    const newCourse = {
        ...courseData,
        courseId: Math.max(0, ...courses.map((c) => c.courseId)) + 1,
        createdAt: new Date().toISOString(),
        createdBy: "current-user-id", // This would come from auth in a real app
        status: 1, // Default to active
        updatedAt: null,
        createdByNavigation: null,
    }

    courses.push(newCourse)
    console.log("Course added:", newCourse)
    return newCourse
}

// Update course status
export function updateCourseStatus(id, status) {
    const courseIndex = courses.findIndex((c) => c.courseId === id)
    if (courseIndex !== -1) {
        courses[courseIndex] = {
            ...courses[courseIndex],
            status,
            updatedAt: new Date().toISOString(),
        }
        console.log("Course status updated:", courses[courseIndex])
        return courses[courseIndex]
    }
    return null
}

// Cancel a course (set status to 0)
export function cancelCourse(id) {
    return updateCourseStatus(id, 0)
}

// Update course
export function updateCourse(id, courseData) {
    const courseIndex = courses.findIndex((c) => c.courseId === id)
    if (courseIndex !== -1) {
        courses[courseIndex] = {
            ...courses[courseIndex],
            ...courseData,
            updatedAt: new Date().toISOString(),
        }
        console.log("Course updated:", courses[courseIndex])
        return courses[courseIndex]
    }
    return null
}

