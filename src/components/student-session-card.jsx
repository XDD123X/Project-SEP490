import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Video, ExternalLink, Info, VideoOff, Speech, FileUp, FileCog, Pencil } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { format } from "date-fns";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { Textarea } from "./ui/textarea";
import { cn } from "@/lib/utils";
import { Separator } from "./ui/separator";
import { SessionBadge } from "./BadgeComponent";

export default function ClassCard({ session }) {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  return (
    <>
      <Card className={cn("w-full max-w-xs overflow-hidden")}>
        <CardContent className="p-0">
          {/* Row 1: Class Name and Status Badge */}
          <div className="flex items-center justify-between px-3 py-2">
            <h3 className="text-xs font-medium">{session.class.classCode}</h3>
            {/* <Badge variant={session.status === 1 ? "outline" : session.status === 2 ? "success" : "destructive"} className="text-xs px-1.5 py-0">
              {session.status === 1 ? "Not Yet" : session.status === 2 ? "Finished" : "Cancelled"}
            </Badge> */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <a href={session.lecturer.meetUrl} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="ghost" className="h-5 w-5 p-0 rounded-full text-green-800">
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </a>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Join Online Meeting</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Separator />

          {/* Row 2: Lecturer Name */}
          <div className="border-b px-3 py-2 flex items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground flex-shrink-0">Lecturer:</p>
            {/* <Speech className="text-muted-foreground w-4 h-4" /> */}
            <span className="text-xs font-medium text-right truncate rtl">{session.lecturer.fullName}</span>
          </div>

          {/* Row 3: Combined Record Icon and Attendance Badge */}
          <div className="flex items-center justify-between border-b px-3 py-2">
            <div className="flex items-center">{session.sessionRecord ? <Video className={`h-4 w-4 text-green-500 `} /> : <VideoOff className={`h-4 w-4 text-red-500 `} />}</div>
            <div className="h-4 border-r mx-2"></div>
            <Badge
              variant={session.attendances === "attended" ? "success" : session.attendances === "absent" ? "destructive" : "outline"}
              className={`text-xs px-1.5 py-0 ${
                session.attendances === "attended" ? "bg-green-100 text-green-800 hover:bg-green-100" : session.attendances === "absent" ? "bg-red-100 text-red-800 hover:bg-red-100" : "bg-gray-100 text-gray-800 hover:bg-gray-100"
              }`}
            >
              {session.attendances === "attended" ? "Attended" : session.attendances === "absent" ? "Absent" : "Not yet"}
            </Badge>
          </div>

          <div className="flex flex-col gap-2 p-2">
            <Button variant="outline" size="sm" className="w-full h-7 text-xs justify-center" onClick={() => setIsDetailOpen(true)}>
              <Info className="mr-1 h-3 w-3" />
              Detail
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{session.class.classCode}</DialogTitle>
            <DialogDescription>Class information and details</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 pb-0">
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-sm font-medium">Class:</span>
              <span className="col-span-3">{session.class.classCode}</span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-sm font-medium">Lecturer:</span>
              <span className="col-span-3">
                {session.lecturer.gender ? "Mr." : "Ms."} {session.lecturer.fullName}
              </span>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-sm font-medium">Number:</span>
              <span className="col-span-3">{session.sessionNumber ?? "-"}</span>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-sm font-medium">Status:</span>
              <span className="col-span-3">
                <SessionBadge status={session.status} />
              </span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-sm font-medium">Description:</span>
              <Textarea defaultValue="" className="col-span-3" readOnly>
                {session.description}
              </Textarea>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-sm font-medium">Recording:</span>
              <span className="col-span-3 flex items-center">
                {session.sessionRecord ? <Video className="mr-2 h-4 w-4 text-green-500" /> : <VideoOff className="mr-2 h-4 w-4 text-red-500" />}
                {session.sessionRecord ? format(new Date(), "dd/MM/yyyy HH:mm:ss") : "Not available"}
              </span>
            </div>
            {session.sessionRecord ? (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <span className="text-sm font-medium">Link:</span>
                  <span className="col-span-3">
                    <a href="https://facebook.com/abc-xyz" target="_blank">
                      <Button variant="outline" size="sm" className="w-full h-7 text-xs justify-center">
                        <ExternalLink className="mr-1 h-3 w-3" />
                        Record Link
                      </Button>
                    </a>
                  </span>
                </div>
                <div className="flex flex-wrap justify-center items-center gap-4">
                  <Button className="w-full md:w-auto justify-center mt-6">
                    <FileCog className="mr-1 h-4 w-4" />
                    Edit Record
                  </Button>
                  <Button className="w-full md:w-auto justify-center mt-6">
                    <Pencil className="mr-1 h-4 w-4" />
                    Edit Session
                  </Button>
                </div>
              </>
            ) : (
              <Button className="w-full justify-center mt-6">
                <FileUp className="mr-1 h-4 w-4" />
                Upload Record
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
