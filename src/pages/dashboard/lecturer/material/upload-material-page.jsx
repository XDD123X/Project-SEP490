import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Upload, File, Video, Loader2, X, Check, Download, Trash2, Eye, Pencil } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { getSessionBySessionId } from "@/services/sessionService";
import { deleteFileById, deleteRecordById, updateFile, uploadFile } from "@/services/uploadFileService";
import { format } from "date-fns";
import { Textarea } from "@/components/ui/textarea";

const API_URL = import.meta.env.VITE_VIDEO_URL;

export default function UploadMaterialBySessionPage() {
  const { classId, sessionId } = useParams();
  const [searchParams] = useSearchParams();
  const [sessionDetails, setSessionDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedRecording, setSelectedRecording] = useState(null);
  const fileInputRef = useRef(null);
  const recordingInputRef = useRef(null);
  const navigate = useNavigate();
  const [uploadType, setUploadType] = useState("recordings");

  //delete file confirm
  const [deleteFile, setDeleteFile] = useState();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  //delete record confirm
  const [deleteRecord, setDeleteRecord] = useState();
  const [isDeletingRecord, setIsDeletingRecord] = useState(false);
  const [isDeleteRecordOpen, setIsDeleteRecordOpen] = useState(false);

  //edit file
  const [editFile, setEditFile] = useState();
  const [isFileEditOpen, setIsFileEditOpen] = useState(false);
  const [isFileEditLoading, setIsFileEditLoading] = useState(false);

  //get upload type
  useEffect(() => {
    const typeFromURL = searchParams.get("type");
    if (typeFromURL === "recordings" || typeFromURL === "files") {
      setUploadType(typeFromURL);
    } else {
      navigate("/*");
    }
  }, [searchParams, navigate]);

  //fetch data
  const fetchSessionDetails = async () => {
    try {
      const response = await getSessionBySessionId(sessionId);
      setSessionDetails(response.data);
    } catch (error) {
      console.error("Failed to fetch session details:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchSessionDetails();
  }, [sessionId]);

  const handleBack = () => {
    const type = uploadType === "recordings" ? "record" : "material";
    navigate(`/lecturer/${type}/${classId}`);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles(filesArray);
    }
  };

  const handleRecordingChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedRecording(e.target.files[0]);
    }
  };

  const handleFileUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.warning("Please select at least one file to upload.");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];

        await uploadFile(file, classId, sessionId, "file", (percent) => {
          // Tính toán tổng tiến độ dựa trên số lượng file
          const overallProgress = ((i + percent / 100) / selectedFiles.length) * 100;
          setUploadProgress(Math.round(overallProgress));
        });
      }

      toast.success(`${selectedFiles.length} file(s) have been uploaded.`);

      // Reset sau khi upload xong
      setUploadProgress(100);
      setSelectedFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      // Nếu cần load lại session sau upload:
      const response = await getSessionBySessionId(sessionId);
      setSessionDetails(response.data);
    } catch (error) {
      console.error("Failed to upload files:", error);
      toast.error("There was an error uploading your files. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleRecordingUpload = async () => {
    if (!selectedRecording) {
      toast.warning("Please select a video recording to upload.");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Tiến trình upload
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          if (prev < 50) return prev + 5;
          else if (prev < 80) return prev + 2;
          else return prev + 3;
        });
      }, 300);

      // Upload video recording (record) file
      await uploadFile(selectedRecording, classId, sessionId, "record", (percent) => {
        setUploadProgress(percent);
      });

      // Sau khi upload xong
      clearInterval(interval);
      setUploadProgress(100);

      toast.success(`${selectedRecording.name} has been uploaded.`);

      // Lấy thông tin session sau khi upload xong
      const response = await getSessionBySessionId(sessionId);
      setSessionDetails(response.data);
      setSelectedRecording(null);

      // Clear input field
      if (recordingInputRef.current) recordingInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to upload recording:", error);
      toast.error("There was an error uploading your recording. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const removeSelectedFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const clearSelectedRecording = () => {
    setSelectedRecording(null);
    if (recordingInputRef.current) {
      recordingInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " bytes";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / 1048576).toFixed(1) + " MB";
  };

  const handleFileClick = (fileUrl) => {
    const fullUrl = `${API_URL}${fileUrl}`;
    window.open(fullUrl, "_blank");
  };

  const handleFileDelete = (fileId) => {
    setDeleteFile(fileId);
    setIsDeleteOpen(true);
  };

  const handleRecordDelete = (recordId) => {
    setDeleteRecord(recordId);
    setIsDeleteRecordOpen(true);
  };

  const confirmDeleteRecord = async () => {
    if (!deleteRecord) return;

    setIsDeletingRecord(true);
    const result = await deleteRecordById(deleteRecord);

    if (result.status === 200) {
      toast.success("Record deleted successfully");
      setSessionDetails((prev) => ({
        ...prev,
        records: prev.records.filter((f) => f.recordId !== deleteRecord),
      }));
    } else {
      toast.error(result.message || "Failed to delete record");
    }

    setIsDeletingRecord(false);
    setIsDeleteRecordOpen(false);
    setDeleteRecord(null);
  };

  const confirmDelete = async () => {
    if (!deleteFile) return;

    setIsDeleting(true);
    const result = await deleteFileById(deleteFile);

    if (result.status === 200) {
      toast.success("File deleted successfully");
      setSessionDetails((prev) => ({
        ...prev,
        files: prev.files.filter((f) => f.fileId !== deleteFile),
      }));
    } else {
      toast.error(result.message || "Failed to delete file");
    }

    setIsDeleting(false);
    setIsDeleteOpen(false);
    setDeleteFile(null);
  };

  const handleFileEdit = async (file) => {
    setEditFile(file);
    setIsFileEditOpen(true);
  };

  const handleFileEditSubmit = async (e) => {
    e.preventDefault();
    setIsFileEditLoading(true);

    try {
      const updatedFile = {
        fileId: editFile.fileId,
        description: editFile.description,
        fileName: editFile.fileName,
      };

      await updateFile(updatedFile);
      fetchSessionDetails();
      setIsFileEditOpen(false);
    } catch (error) {
      console.error("Error updating file:", error);
    } finally {
      setIsFileEditLoading(false);
    }
  };

  const handleFileEditChange = (e) => {
    const { name, value } = e.target;
    setEditFile((prev) => ({
      ...prev,
      [name]: value,
    }));
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
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Sessions
      </Button>

      {sessionDetails && (
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Session #{sessionDetails.sessionNumber}</h1>
          <p className="text-muted-foreground">
            {sessionDetails.class.classCode} - {sessionDetails.class.className}
          </p>
          <p>
            Slot {sessionDetails.slot}, {sessionDetails.sessionDate ? format(sessionDetails.sessionDate, "dd/MM/yyyy") : "TBD"}
          </p>
        </div>
      )}

      <Tabs defaultValue={uploadType} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="recordings">Recordings</TabsTrigger>
          <TabsTrigger value="files" disabled>
            Files
          </TabsTrigger>
        </TabsList>

        {/* recording tabs */}
        <TabsContent value="recordings">
          <div className="grid gap-8 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Upload Recording</CardTitle>
              </CardHeader>
              <CardContent className="">
                <div className="space-y-4">
                  <div className="grid w-full gap-1.5">
                    <Label htmlFor="recording">Select Video Recording</Label>
                    <Input id="recording" type="file" accept="video/*" onChange={handleRecordingChange} ref={recordingInputRef} disabled={uploading} />
                  </div>

                  {selectedRecording && (
                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-medium">Selected Recording:</p>
                      <div className="rounded-md border p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Video className="mr-2 h-4 w-4" />
                            <span className="text-sm">{selectedRecording.name}</span>
                            <span className="ml-2 text-xs text-muted-foreground">({formatFileSize(selectedRecording.size)})</span>
                          </div>
                          <Button variant="ghost" size="icon" onClick={clearSelectedRecording} disabled={uploading}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {uploading && (
                    <div className="space-y-2">
                      <div className="mt-2 rounded-md bg-yellow-50 p-3 text-sm text-yellow-800">
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="mr-2 h-5 w-5">
                            <path
                              fillRule="evenodd"
                              d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <strong>Warning:</strong> Please do not close this page while upload is in progress.
                        </div>
                      </div>
                    </div>
                  )}

                  {sessionDetails?.records.length !== 0 ? (
                    <Button disabled className="w-full">
                      <Check className="mr-2 h-4 w-4" />
                      Already Uploaded
                    </Button>
                  ) : (
                    <Button onClick={handleRecordingUpload} disabled={!selectedRecording || uploading} className="w-full">
                      {uploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Upload Recording
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Uploaded Recordings</CardTitle>
              </CardHeader>
              <CardContent>
                {sessionDetails?.records.length ? (
                  <div className="space-y-4">
                    {sessionDetails.records.map((recording, index) => (
                      <div key={recording.recordId} className="flex items-start justify-between rounded-md border p-3">
                        <div className="space-y-1">
                          <div className="flex items-center">
                            <Video className="mr-2 h-4 w-4" />
                            <span className="font-medium">Record {index + 1}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">Duration: {recording?.duration?.split(".")[0] ?? ""}</p>
                          <p className="text-xs text-muted-foreground">Uploaded: {format(recording.createdAt, "HH:mm, dd/MM/yyyy")}</p>
                        </div>
                        <div className="space-y-2 grid grid-cols-1">
                          <Button size="sm" variant="outline" onClick={() => navigate(`/record/${sessionDetails.sessionId}`)}>
                            <Eye className="w-4 h-4" />
                            Watch
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleRecordDelete(recording.recordId)}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex h-40 items-center justify-center rounded-md border border-dashed">
                    <p className="text-center text-muted-foreground">No recordings uploaded yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* file tab */}
        <TabsContent value="files">
          <div className="grid gap-8 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Upload Files</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid w-full gap-1.5">
                    <Label htmlFor="files">Select Files</Label>
                    <Input id="files" type="file" multiple onChange={handleFileChange} ref={fileInputRef} disabled={uploading} />
                  </div>

                  {selectedFiles.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-medium">Selected Files:</p>
                      <div className="max-h-40 overflow-y-auto rounded-md border p-2">
                        {selectedFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between py-1">
                            <div className="flex items-center">
                              <File className="mr-2 h-4 w-4" />
                              <span className="text-sm">{file.name}</span>
                              <span className="ml-2 text-xs text-muted-foreground">({formatFileSize(file.size)})</span>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => removeSelectedFile(index)} disabled={uploading}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {uploading && (
                    <div className="space-y-2">
                      <div className="mt-2 rounded-md bg-yellow-50 p-3 text-sm text-yellow-800">
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="mr-2 h-5 w-5">
                            <path
                              fillRule="evenodd"
                              d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <strong>Warning:</strong> Please do not close this page while upload is in progress.
                        </div>
                      </div>
                    </div>
                  )}

                  <Button onClick={handleFileUpload} disabled={selectedFiles.length === 0 || uploading} className="w-full">
                    {uploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Files
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Uploaded Files</CardTitle>
              </CardHeader>
              <CardContent>
                {sessionDetails?.files && sessionDetails?.files.length > 0 ? (
                  <div className="space-y-4">
                    {sessionDetails.files.map((file) => (
                      <div key={file.fileId} className="flex items-start justify-between rounded-md border p-3">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center">
                            <File className="mr-2 h-4 w-4" />
                            <span className="font-medium truncate" style={{ maxWidth: "250px" }}>
                              {file.fileName}
                            </span>
                            {/* Truncate tên file */}
                          </div>
                          <p className="text-xs text-muted-foreground">Description: {file.description || "-"}</p>
                          <p className="text-xs text-muted-foreground">Size: {formatFileSize(file.fileSize)}</p>
                          <p className="text-xs text-muted-foreground">Uploaded: {new Date(file.createdAt).toLocaleString()}</p>
                        </div>

                        <div className="mt-2 flex items-center justify-center gap-2">
                          <Button variant="outline" size="icon" onClick={() => handleFileEdit(file)}>
                            <Pencil />
                          </Button>
                          <Button variant="outline" size="icon" onClick={() => handleFileClick(file.fileUrl)}>
                            <Download />
                          </Button>
                          <Button variant="outline" size="icon" onClick={() => handleFileDelete(file.fileId)}>
                            <Trash2 className="text-red-500" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex h-40 items-center justify-center rounded-md border border-dashed">
                    <p className="text-center text-muted-foreground">No files uploaded yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* file remove dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>Are you sure you want to delete this file? This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDeleteOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* record remove dialog */}
      <Dialog open={isDeleteRecordOpen} onOpenChange={setIsDeleteRecordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>Are you sure you want to delete this record? This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDeleteRecordOpen(false)} disabled={isDeletingRecord}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteRecord} disabled={isDeletingRecord}>
              {isDeletingRecord ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* File Edit Dialog */}
      <Dialog open={isFileEditOpen} onOpenChange={setIsFileEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit File Information</DialogTitle>
            <DialogDescription>Update the file description and name attachment.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleFileEditSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="fileNameAttachment">File Name Attachment</Label>
              <Input id="fileName" name="fileName" value={editFile?.fileName || ""} onChange={handleFileEditChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" value={editFile?.description || ""} onChange={handleFileEditChange} rows={4} />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsFileEditOpen(false)} disabled={isFileEditLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isFileEditLoading}>
                {isFileEditLoading ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
