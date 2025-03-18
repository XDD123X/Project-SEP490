/* eslint-disable react/prop-types */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export function SubmitSection({ classData }) {
  const [showJson, setShowJson] = useState(false);

  // Prepare the data that would be sent to the API
  const prepareApiData = () => {
    // Create a simplified version of the class data for API submission
    // This removes unnecessary nested data and keeps only what's needed
    const apiData = {
      classId: classData.classId,
      classCode: classData.classCode,
      className: classData.className,
      lecturerId: classData.lecturerId,
      courseId: classData.courseId,
      totalSession: classData.totalSession,
      startDate: classData.startDate,
      endDate: classData.endDate,
      classUrl: classData.classUrl,
      scheduled: classData.scheduled,
      status: classData.status,
      // Include only student IDs in the class
      classStudents: classData.classStudents.map((cs) => ({
        classStudentId: cs.classStudentId,
        classId: cs.classId,
        studentId: cs.studentId,
      })),
    };

    return apiData;
  };

  const handleSubmit = () => {
    // In a real application, this would send the data to an API
    // For now, we'll just toggle showing the JSON
    setShowJson(!showJson);

    // Example of how you would submit to an API
    // const apiData = prepareApiData()
    // fetch('/api/classes/update', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(apiData),
    // })
    // .then(response => response.json())
    // .then(data => console.log('Success:', data))
    // .catch((error) => console.error('Error:', error))
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Submit Changes</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">Click the button below to submit your changes to the server. This will update the class information and student roster.</p>

        {showJson && (
          <div className="mb-4">
            <p className="text-sm font-medium mb-2">API Request Payload:</p>
            <ScrollArea className="h-[200px] rounded-md border bg-muted p-4">
              <pre className="text-xs">{JSON.stringify(prepareApiData(), null, 2)}</pre>
            </ScrollArea>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleSubmit} className="w-full">
          {showJson ? "Hide JSON" : "Submit to API"}
        </Button>
      </CardFooter>
    </Card>
  );
}
