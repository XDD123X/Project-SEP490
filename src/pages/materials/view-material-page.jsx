import { useState, useEffect } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileIcon, Eye, Download, Clock, User } from "lucide-react";
import { useParams } from "react-router-dom";
import { format } from "date-fns";
import { getSessionsByClassId } from "@/services/sessionService";
import { GetClassById } from "@/services/classService";
import { downloadFileService } from "@/services/uploadFileService";

// Simulate viewing a file online
export async function viewFile(fileId, classId) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // In a real application, this would generate a temporary URL or token
  // for viewing the file in a browser
  console.log(`Viewing file ${fileId} from class ${classId}`);

  // Return a mock URL that would typically point to a file viewer
  return `/api/view/${classId}/${fileId}`;
}

export default function ViewClassMaterialPage() {
  const { classId } = useParams();
  const [sessions, setSessions] = useState([]);
  const [classData, setClassData] = useState();
  const [loading, setLoading] = useState(true);
  const [fileActionLoading, setFileActionLoading] = useState({});

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " bytes";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / 1048576).toFixed(1) + " MB";
  };

  useEffect(() => {
    async function fetchMaterials() {
      try {
        const response = await getSessionsByClassId(classId);
        const classData = await GetClassById(classId);
        console.log(response.data);

        setSessions(response.data);
        setClassData(classData.data);
      } catch (error) {
        console.error("Error fetching materials:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchMaterials();
  }, [classId]);

  const handleViewFile = async (fileUrl) => {
    const apiUrl = import.meta.env.VITE_VIDEO_URL;
    const fullUrl = `${apiUrl}${fileUrl}`;
    window.open(fullUrl, "_blank");
  };

  const handleDownloadFile = async (fileId, fileName) => {
    setFileActionLoading((prev) => ({ ...prev, [fileId]: "download" }));
    try {
      await downloadFileService(fileId, fileName);
    } catch (error) {
      console.error("Error downloading file:", error);
    } finally {
      setFileActionLoading((prev) => {
        const newState = { ...prev };
        delete newState[fileId];
        return newState;
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-2xl font-bold mb-6">Class Materials</h1>
        <div className="bg-muted p-6 rounded-lg text-center">Loading materials...</div>
      </div>
    );
  }

  if (!sessions || sessions.length === 0) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-2xl font-bold mb-6">Class {classData.classCode} Materials</h1>
        <div className="bg-muted p-6 rounded-lg text-center">No materials available for this class.</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">{classData.classCode} Materials</h1>
      <Accordion type="single" collapsible className="w-full space-y-4">
        {sessions.map((session) => (
          <AccordionItem key={session.sessionNumber} value={`session-${session.sessionNumber}`} className="border rounded-lg">
            <AccordionTrigger className="px-4 py-2 hover:no-underline">
              <div className="flex items-center text-left w-full">
                <span className="font-medium">Session {session.sessionNumber}</span>
                <span className="ml-4 text-muted-foreground">{format(session.sessionDate, "EEEE, dd/MM/yyyy")}</span>
                <span className="ml-auto text-sm text-muted-foreground">
                  {session.files.length} {session.files.length === 1 ? "file" : "files"}
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 pt-2">
              {session.files.length === 0 ? (
                <div className="bg-muted p-4 rounded-lg text-center text-muted-foreground">No material for this session yet</div>
              ) : (
                <div className="grid gap-4">
                  {session.files.map((file) => (
                    <Card key={file.fileId}>
                      <CardHeader className="pb-2">
                        <div className="flex items-start gap-2">
                          <FileIcon className="h-5 w-5 mt-0.5 text-muted-foreground" />
                          <div className="max-w-[150px] sm:max-w-[300px] truncate">
                            <h3 className="font-medium truncate">{file.fileName}</h3>
                            <p className="text-sm text-muted-foreground">{formatFileSize(file.fileSize)}</p>
                          </div>
                        </div>
                      </CardHeader>
                      {file.description && (
                        <CardContent className="pb-2 pt-0">
                          <p className="text-sm">{file.description}</p>
                        </CardContent>
                      )}
                      <CardFooter className="flex flex-col items-start gap-4 pt-0 sm:flex-row sm:justify-between">
                        <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{format(file.createdAt, "HH:mm:ss, dd/MM/yyyy")}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleViewFile(file.fileUrl)} disabled={fileActionLoading[file.fileId] === "view"}>
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <Button variant="default" size="sm" onClick={() => handleDownloadFile(file.fileId, file.fileName)} disabled={fileActionLoading[file.fileId] === "download"}>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
