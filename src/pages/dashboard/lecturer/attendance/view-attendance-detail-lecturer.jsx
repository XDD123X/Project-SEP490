import { AttendanceForm } from "@/components/attendance/attendance-form";
import { useParams } from "react-router-dom";

export default function ViewAttendanceDetailLecturerPage() {
  const { classId, sessionId } = useParams();
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Take Attendance</h1>
      <AttendanceForm classId={classId} sessionId={sessionId} />
    </div>
  );
}
