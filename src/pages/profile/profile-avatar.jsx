import React, { useEffect } from "react";
import { useRef, useState } from "react";
import { Camera, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useStore } from "@/services/StoreContext";

export default function ProfileAvatar() {
  const [isUploading, setIsUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const fileInputRef = useRef(null);

  const { state } = useStore();
  const { user } = state;

  useEffect(() => {
    setAvatarUrl(user.imgUrl);
  }, [user.imgUrl]);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      // In a real application, you would upload the file to a server here
      // For this example, we'll just use URL.createObjectURL
      const objectUrl = URL.createObjectURL(file);
      setAvatarUrl(objectUrl);

      // Simulate upload delay
      setTimeout(() => {
        setIsUploading(false);
      }, 1000);
    } catch (error) {
      console.error("Error uploading file:", error);
      setIsUploading(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleSave = () => {
    alert("Avatar updated successfully!");
  };

  return (
    <div className="container flex items-center justify-start">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Change Your Avatar</CardTitle>
          <CardDescription>Upload a new profile picture</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6">
          <div onClick={handleAvatarClick} className="relative cursor-pointer group">
            <div className={cn("relative h-64 w-64 rounded-full overflow-hidden border-2 border-muted bg-muted", isUploading && "opacity-50")}>
              {avatarUrl ? (
                <img src={avatarUrl || "/placeholder.svg"} alt="Avatar" className="object-cover fill" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted text-3xl font-semibold uppercase text-muted-foreground">{isUploading ? <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" /> : "JD"}</div>
              )}
            </div>
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
              <Camera className="h-10 w-10 text-white" />
            </div>
          </div>

          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" disabled={isUploading} />

          <div className="flex gap-4">
            <Button variant="outline" onClick={handleAvatarClick} disabled={isUploading} className="w-32">
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Choose File"
              )}
            </Button>

            <Button onClick={handleSave} disabled={!avatarUrl || isUploading} className="w-32">
              Save Avatar
            </Button>
          </div>

          <p className="text-sm text-muted-foreground text-center">
            Click on the avatar or the "Choose File" button to upload a new image.
            <br />
            Square images work best.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
