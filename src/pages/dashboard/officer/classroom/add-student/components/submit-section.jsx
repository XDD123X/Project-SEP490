/* eslint-disable react/prop-types */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { AddStudentsToClass, UpdateStudentsInClass } from "@/services/classService";
import { useNavigate } from "react-router-dom";

export function SubmitSection({ classData }) {
  const [showJson, setShowJson] = useState(false);
  const [origin, setOrigin] = useState(classData.classStudents.length);
  const navigate = useNavigate()
  // Prepare the data that would be sent to the API
  const prepareApiData = () => {
    const apiData = {
      classId: classData.classId,
      studentIds: classData.classStudents.map((cs) => cs.studentId),
    };

    return apiData;
  };

  const handleSubmit = async () => {
    // In a real application, this would send the data to an API
    // For now, we'll just toggle showing the JSON
    // setShowJson(!showJson);

    // Example of how you would submit to an API
    const apiData = prepareApiData();
    try {
      if (origin === 0) {
        //add
        const response = await AddStudentsToClass(apiData);
      } else {
        //update
        const response = await UpdateStudentsInClass(apiData);
      }
      navigate(`/officer/class/detail?classId=${apiData.classId}`)
      toast.success("Class Students Updated Successfully!");
    } catch (error) {
      toast.error(error);
    }
  };

  return (
    <Button onClick={handleSubmit} className="w-full">
      Save
    </Button>
  );
}
