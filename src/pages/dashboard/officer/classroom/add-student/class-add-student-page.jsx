import { useEffect, useState } from "react";
import { ClassSelectionCard } from "./components/class-selection-card";
import { ClassInfoCard } from "./components/class-info-card";
import { ClassActionButtons } from "./components/class-action-button";
import { ClassStudentsCard } from "./components/class-student-card";
import { SubmitSection } from "./components/submit-section";
import { AllStudentsCard } from "./components/all-student-card";
import { getStudentList } from "@/services/accountService";
import { toast } from "sonner";

export default function ClassAddStudentPage() {
  const [selectedClass, setSelectedClass] = useState(null);
  const [allStudents, setAllStudents] = useState([]);
  const [students, setStudents] = useState([]);

  //Fetch student list
  useEffect(() => {
    const fetchData = async () => {
      try {
        const studentList = await getStudentList();

        if (studentList.status === 200 || studentList.data !== null) {
          setStudents(studentList.data);
        } else {
          toast.error("Failed Fetching Data");
        }
      } catch (error) {
        toast.error(error);
      }
    };
    fetchData();
  }, []);

  // Function to handle class selection
  const handleClassSelect = (classData) => {
    setSelectedClass(classData);
    //get ids list
    const classStudentIds = new Set(classData.classStudents.map(cs => cs.studentId));
    
    //filter
    const filteredStudents = students.filter(student => !classStudentIds.has(student.accountId));

    // In a real app, you would fetch all students here
    // For now, we'll create some dummy data
    const studentsNotInClassSample = Array(10)
      .fill(0)
      .map((_, i) => ({
        accountId: `student-${i + 10}`,
        email: `student${i + 10}@gmail.com`,
        fullName: `Student ${i + 10}`,
        roleId: "b5ec52be-e7ea-442c-927e-f023416f2202",
        fulltime: true,
        phoneNumber: "0123456789",
        dob: "2000-01-01",
        gender: i % 2 === 0,
        imgUrl: "https://ui.shadcn.com/avatars/shadcn.jpg",
        meetUrl: "https://example.com/meet/euf-nwbu-cet",
        status: 1,
        createdAt: "2025-03-18T20:52:54.453",
        updatedAt: null,
        role: null,
      }));

    setAllStudents(filteredStudents);
  };

  // Function to remove student from class
  const handleRemoveStudent = (studentId) => {
    if (!selectedClass) return;

    // Find the student being removed so we can add them back to allStudents
    const studentToRemove = selectedClass.classStudents.find((cs) => cs.studentId === studentId);

    const updatedClass = {
      ...selectedClass,
      classStudents: selectedClass.classStudents.filter((cs) => cs.studentId !== studentId),
    };

    setSelectedClass(updatedClass);

    // Add the removed student back to allStudents list
    if (studentToRemove && studentToRemove.student) {
      setAllStudents([...allStudents, studentToRemove.student]);
    }
  };

  // Function to add students to class
  const handleAddStudents = (studentIds) => {
    if (!selectedClass) return;

    const newClassStudents = studentIds.map((studentId) => {
      const student = allStudents.find((s) => s.accountId === studentId);
      return {
        classStudentId: Math.floor(Math.random() * 1000), // Generate a random ID for demo
        classId: selectedClass.classId,
        studentId: studentId,
        student: student,
      };
    });

    const updatedClass = {
      ...selectedClass,
      classStudents: [...selectedClass.classStudents, ...newClassStudents],
    };

    setSelectedClass(updatedClass);

    // Remove added students from allStudents list
    setAllStudents(allStudents.filter((student) => !studentIds.includes(student.accountId)));
  };

  // Function to handle imported students
  const handleImportStudents = (importedStudents, mode) => {
    if (!selectedClass) return;

    // Create class student entries for each imported student
    const newClassStudents = importedStudents.map((student) => {
      return {
        classStudentId: Math.floor(Math.random() * 1000), // Generate a random ID for demo
        classId: selectedClass.classId,
        studentId: student.accountId,
        student: student,
      };
    });

    let updatedClass;

    if (mode === "add") {
      // Add new students to existing ones
      updatedClass = {
        ...selectedClass,
        classStudents: [...selectedClass.classStudents, ...newClassStudents],
      };
    } else {
      // Replace all students with imported ones
      updatedClass = {
        ...selectedClass,
        classStudents: [...newClassStudents],
      };
    }

    setSelectedClass(updatedClass);
  };

  return (
    <main className="container mx-auto py-6 px-4">
      <h1 className="text-3xl font-bold mb-6">Classroom Management</h1>
      <div className="space-y-6">
        {!selectedClass ? (
          <ClassSelectionCard onClassSelect={handleClassSelect} />
        ) : (
          <div className="space-y-6">
            <div className="w-full">
              <ClassInfoCard classData={selectedClass} />
            </div>

            {/* Add the action buttons below the class info card */}
            <ClassActionButtons classData={selectedClass} onImportStudents={handleImportStudents} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ClassStudentsCard classData={selectedClass} onRemoveStudent={handleRemoveStudent} />
              <AllStudentsCard students={allStudents} onAddStudents={handleAddStudents} />
            </div>

            {/* Add the submit section below the student cards */}
            <SubmitSection classData={selectedClass} />
          </div>
        )}
      </div>
    </main>
  );
}
