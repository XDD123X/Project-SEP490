import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Calendar, User, BookOpen, Hash } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getSessionBySessionId } from "@/services/sessionService";
import { Spinner } from "@/components/ui/spinner";
import { VideoPlayer } from "@/components/ui/video-player";

const VIDEO_URL = import.meta.env.VITE_VIDEO_URL;

export default function RecordVideoPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState();
  const [record, setRecord] = useState();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getSessionBySessionId(sessionId);
        if (response.status === 200) {
          const data = response.data;
          setSession(data);

          if (data.records && data.records.length > 0) {
            setRecord(data.records[0]);
            console.log(response.data);
          } else {
            navigate("/sessions");
          }
        }
      } catch (error) {
        toast.error(error?.message || "Failed to load session");
      }
    };

    fetchData();
  }, [sessionId, navigate]);

  if (!session) {
    return (
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Session Recording</h1>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Session Details Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-muted-foreground" />
                Session Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-[1fr_auto] gap-2">
                <span className="text-muted-foreground">Session Number:</span>
                <span className="font-medium text-right">{session.sessionNumber}</span>

                <span className="text-muted-foreground">Class Code:</span>
                <span className="font-medium text-right">{session.class.classCode}</span>

                <span className="text-muted-foreground">Class Name:</span>
                <span className="font-medium text-right">{session.class.className}</span>

                <span className="text-muted-foreground">Lecturer:</span>
                <span className="font-medium text-right">{session.lecturer.fullName}</span>
              </div>
            </CardContent>
          </Card>

          {/* Record Details Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Hash className="h-5 w-5 text-muted-foreground" />
                Record Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-[1fr_auto] gap-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Duration:</span>
                </div>
                <span className="font-medium text-right">{record.duration}</span>

                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Created Date:</span>
                </div>
                <span className="font-medium text-right">{record.createdAt}</span>

                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>Uploaded By:</span>
                </div>
                <span className="font-medium text-right"> {record.uploadedByNavigation.fullName} </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="rounded-lg overflow-hidden shadow-lg">
          <VideoPlayer videoUrl={`${VIDEO_URL}${record.videoUrl}`} />
        </div>
      </div>
    </div>
  );
}
