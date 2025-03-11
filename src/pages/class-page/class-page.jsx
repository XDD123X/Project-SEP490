import { useState } from "react"
import { ChevronDown, Clock, Users, Calendar, MapPin } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// Sample class data
const classes = [
  {
    id: 1,
    name: "Introduction to Web Development",
    instructor: "Prof. Sarah Johnson",
    schedule: "Mon, Wed, Fri 10:00 AM - 11:30 AM",
    location: "Tech Building, Room 305",
    capacity: "28/30",
    status: "In Progress",
    description:
      "Learn the fundamentals of web development including HTML, CSS, and JavaScript. This course covers the basics of creating responsive websites and web applications.",
    prerequisites: "None",
    materials: ["Laptop", "Text editor", "Web browser"],
    assignments: [
      { name: "HTML Basics", due: "Sep 15" },
      { name: "CSS Styling", due: "Sep 29" },
      { name: "JavaScript Project", due: "Oct 20" },
    ],
  },
  {
    id: 2,
    name: "Data Structures and Algorithms",
    instructor: "Dr. Michael Chen",
    schedule: "Tue, Thu 1:00 PM - 3:00 PM",
    location: "Science Hall, Room 210",
    capacity: "22/25",
    status: "In Progress",
    description:
      "A comprehensive study of data structures and algorithms, focusing on implementation, analysis, and application to solve computational problems efficiently.",
    prerequisites: "Introduction to Programming, Discrete Mathematics",
    materials: ["Algorithm textbook", "Laptop with IDE installed"],
    assignments: [
      { name: "Array Implementation", due: "Sep 18" },
      { name: "Linked Lists", due: "Oct 2" },
      { name: "Sorting Algorithms", due: "Oct 25" },
    ],
  },
  {
    id: 3,
    name: "Mobile App Development",
    instructor: "Prof. Emily Rodriguez",
    schedule: "Wed, Fri 2:00 PM - 4:00 PM",
    location: "Innovation Center, Lab 4",
    capacity: "15/20",
    status: "Completed",
    description:
      "Design and develop mobile applications for iOS and Android platforms. Learn UI/UX principles, app architecture, and deployment processes.",
    prerequisites: "Object-Oriented Programming",
    materials: ["Smartphone (iOS or Android)", "Development environment"],
    assignments: [
      { name: "UI Design", due: "Sep 20" },
      { name: "App Prototype", due: "Oct 10" },
      { name: "Final Project", due: "Nov 15" },
    ],
  },
]

export default function ClassPage() {
  const [expandedId, setExpandedId] = useState(null)

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id)
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">My Classes</h1>
      <div className="grid gap-6">
        {classes.map((classItem) => (
          <Card
            key={classItem.id}
            className={cn(
              "transition-all duration-300 overflow-hidden",
              expandedId === classItem.id ? "shadow-lg" : "hover:shadow-md",
            )}
          >
            <CardHeader
              className={cn(
                "cursor-pointer flex flex-row items-center justify-between",
                expandedId === classItem.id ? "pb-2" : "",
              )}
              onClick={() => toggleExpand(classItem.id)}
            >
              <div>
                <CardTitle>{classItem.name}</CardTitle>
                <CardDescription>{classItem.instructor}</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    classItem.status === "In Progress"
                      ? "default"
                      : classItem.status === "Completed"
                        ? "secondary"
                        : "outline"
                  }
                >
                  {classItem.status}
                </Badge>
                <ChevronDown
                  className={cn(
                    "h-5 w-5 transition-transform duration-300",
                    expandedId === classItem.id ? "rotate-180" : "",
                  )}
                />
              </div>
            </CardHeader>

            <CardContent
              className={cn(
                "grid transition-all duration-300",
                expandedId === classItem.id ? "grid-rows-[1fr] pt-2" : "grid-rows-[0fr]",
              )}
            >
              <div className="overflow-hidden">
                <div className="flex flex-wrap gap-4 mb-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{classItem.schedule}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{classItem.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{classItem.capacity}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-1">Description</h3>
                    <p className="text-sm text-muted-foreground">{classItem.description}</p>
                  </div>

                  <div>
                    <h3 className="font-medium mb-1">Prerequisites</h3>
                    <p className="text-sm text-muted-foreground">{classItem.prerequisites}</p>
                  </div>

                  <div>
                    <h3 className="font-medium mb-1">Required Materials</h3>
                    <ul className="list-disc list-inside text-sm text-muted-foreground">
                      {classItem.materials.map((material, index) => (
                        <li key={index}>{material}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-medium mb-1">Upcoming Assignments</h3>
                    <div className="grid gap-2">
                      {classItem.assignments.map((assignment, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{assignment.name}</span>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span className="text-muted-foreground">Due: {assignment.due}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

