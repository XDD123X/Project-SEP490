import { useEffect, useState } from "react";
import { ClassSelectionCard } from "./components/class-selection-card";
import { ClassInfoCard } from "./components/class-info-card";
import { ClassActionButtons } from "./components/class-action-button";
import { ClassStudentsCard } from "./components/class-student-card";
import { SubmitSection } from "./components/submit-section";
import { AllStudentsCard } from "./components/all-student-card";
import { getStudentList } from "@/services/accountService";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";
import { GetClassById } from "@/services/classService";
import { set } from "date-fns";

export default function ClassAddStudentPage() {
  const navigate = useNavigate();
  const { classId, setClassId } = useParams("");
  const [selectedClass, setSelectedClass] = useState(null);
  const [allStudents, setAllStudents] = useState([]);
  const [students, setStudents] = useState([]);

  //Fetch student list
  useEffect(() => {
    const fetchData = async () => {
      try {
        const studentList = await getStudentList();

        if (studentList.status === 200 || studentList.data !== null) {
          setStudents(studentList.data.filter((s) => s.status !== 0));
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
    navigate(`/officer/class/add-student/${classData.classId}`);
  };

  //handle classId
  useEffect(() => {
    // Kiểm tra định dạng GUID hợp lệ
    const isValidGuid = (guid) => {
      const guidPattern = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
      return guidPattern.test(guid);
    };

    // Kiểm tra nếu classId không hợp lệ
    if (!classId || !isValidGuid(classId)) {
      return; // Nếu không hợp lệ, không làm gì cả
    }

    // Hàm lấy dữ liệu lớp học từ API
    const fetchClassData = async () => {
      try {
        const classData = await GetClassById(classId); // Giả sử GetClassById là hàm gọi API

        // Kiểm tra nếu lớp học có dữ liệu hợp lệ
        if (classData.status === 200 && classData.data) {
          // Cập nhật lớp học vào state
          setSelectedClass(classData.data);

          // Lọc danh sách sinh viên không thuộc lớp học
          const classStudentIds = new Set(classData.data.classStudents.map((cs) => cs.studentId));
          const filteredStudents = students.filter((student) => !classStudentIds.has(student.accountId));

          // Cập nhật danh sách tất cả sinh viên
          setAllStudents(filteredStudents);
        } else {
          toast.error("Class data not found.");
        }
      } catch (error) {
        toast.error("Error fetching class data.");
      }
    };

    // Gọi hàm fetch dữ liệu lớp học
    fetchClassData();
  }, [classId, students]);

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

    const AvailableList = importedStudents.filter((student) => student.accountId !== null);

    let updatedClass;

    if (mode === "add") {
      // Lọc để tránh trùng studentId
      const existingStudentIds = new Set(selectedClass.classStudents.map((cs) => cs.studentId));
      const uniqueStudents = AvailableList.filter((student) => !existingStudentIds.has(student.accountId));
      const newClassStudents = uniqueStudents.map((student) => ({
        classId: selectedClass.classId,
        studentId: student.accountId,
        student: student,
      }));
      if (uniqueStudents.length === 0) {
        toast.error(`All Students Already In The Class`);
      } else {
        toast.success(`Added ${uniqueStudents.length} To Class Successfully`);
      }

      updatedClass = {
        ...selectedClass,
        classStudents: [...selectedClass.classStudents, ...newClassStudents],
      };
    } else {
      const newClassStudents = AvailableList.map((student) => ({
        classId: selectedClass.classId,
        studentId: student.accountId,
        student: student,
      }));
      toast.success(`Added ${newClassStudents.length} To Class Successfully`);

      updatedClass = {
        ...selectedClass,
        classStudents: [...newClassStudents],
      };
    }

    setSelectedClass(updatedClass);

    // Cập nhật lại allStudents để loại bỏ những student có email trùng
    const importedEmails = new Set(AvailableList.map((s) => s.email));
    const updatedAllStudents = allStudents.filter((s) => !importedEmails.has(s.email));
    setAllStudents(updatedAllStudents);
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
              <ClassInfoCard classData={selectedClass} setSelectedClass={setSelectedClass} />
            </div>

            {/* Add the action buttons below the class info card */}
            <ClassActionButtons classData={selectedClass} studentsData={students} onImportStudents={handleImportStudents} />

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
