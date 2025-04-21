import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Calendar, FolderPlus, FolderCog } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { getSessionsByClassId } from "@/services/sessionService";
import { format } from "date-fns";
import { SessionBadge } from "@/components/BadgeComponent";

export default function ViewSessionByFileClassMaterialPage() {
  const [sessions, setSessions] = useState([]);
  const [classDetails, setClassDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { classId } = useParams();

  useEffect(() => {
    async function fetchData() {
      try {
        const sessionsData = await getSessionsByClassId(classId);
        setSessions(sessionsData.data);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [classId]);

  const handleSessionSelect = (sessionId) => {
    navigate(`/lecturer/material/${classId}/${sessionId}?type=files`);
  };

  const handleBack = () => {
    navigate("/lecturer/material");
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Button onClick={handleBack} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Classes
      </Button>

      {classDetails && (
        <div className="mb-8">
          <h1 className="text-3xl font-bold">{classDetails.className}</h1>
          <p className="text-muted-foreground">Class Code: {classDetails.classCode}</p>
        </div>
      )}

      <h2 className="mb-6 text-2xl font-semibold">Upload Material For Sessions</h2>

      {sessions.length > 0 ? (
        <div className="rounded-md border">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-3 text-left font-medium">Session Number</th>
                <th className="p-3 text-left font-medium">Date</th>
                <th className="p-3 text-left font-medium">Materials</th>
                <th className="p-3 text-left font-medium">Status</th>
                <th className="p-3 text-left font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => (
                <tr key={session.sessionId} className="border-b">
                  <td className="p-3">
                    <div className="flex items-center">
                      {/* <Calendar className="mr-1 h-5 w-5" /> */}#{session.sessionNumber}
                    </div>
                  </td>
                  <td className="p-3">
                    Slot {session.slot} - {format(session.sessionDate, "EEEE, dd/MM/yyyy")}
                  </td>
                  <td className="p-3">{session?.files && session.files.length > 0 ? `${session.files.length} files` : <span className="text-muted-foreground text-sm">N/A</span>}</td>
                  <td className="p-3">
                    <SessionBadge status={session.status} />
                  </td>
                  <td className="p-3">
                    {session.files && session.files.length === 0 ? (
                      <Button size="sm" onClick={() => handleSessionSelect(session.sessionId)} disabled={session.status === 0}>
                        <FolderPlus className="w-4 h-4 mr-2" />
                        Upload File
                      </Button>
                    ) : (
                      <Button size="sm" onClick={() => handleSessionSelect(session.sessionId)} disabled={session.status === 0}>
                        <FolderCog className="w-4 h-4 mr-2" />
                        Manage
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">No sessions available yet for this class.</p>
        </div>
      )}
    </div>
  );
}
