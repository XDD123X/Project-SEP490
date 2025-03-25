"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Check, X, ZoomIn, ZoomOut } from "lucide-react";
import Cropper from "react-easy-crop";
import { Slider } from "@/components/ui/slider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function AvatarUploadCard({ currentAvatarUrl, onAvatarChange, user }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isCropping, setIsCropping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cropRatioError, setCropRatioError] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onload = () => {
        setSelectedImage(reader.result);
        setIsCropping(true);
        setZoom(1);
        setCrop({ x: 0, y: 0 });
      };

      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);

    // Check if the crop aspect ratio is close to 1:1
    // This should always be 1:1 with react-easy-crop when aspect is set to 1,
    // but we'll keep the check for safety
    const aspectRatio = croppedAreaPixels.width / croppedAreaPixels.height;
    setCropRatioError(Math.abs(aspectRatio - 1) > 0.05);
  }, []);

  const createImage = (url) => {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener("load", () => resolve(image));
      image.addEventListener("error", (error) => reject(error));
      image.src = url;
    });
  };

  const getCroppedImg = async () => {
    try {
      const image = await createImage(selectedImage);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        return null;
      }

      // Set canvas size to the cropped size
      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;

      // Draw the cropped image onto the canvas
      ctx.drawImage(image, croppedAreaPixels.x, croppedAreaPixels.y, croppedAreaPixels.width, croppedAreaPixels.height, 0, 0, croppedAreaPixels.width, croppedAreaPixels.height);

      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          if (!blob) return;
          const file = new File([blob], "avatar.png", { type: "image/png" });
          resolve(file);
        }, "image/png");
      });
    } catch (e) {
      console.error("Error creating cropped image:", e);
      return null;
    }
  };

  const handleSaveCrop = async () => {
    if (cropRatioError) {
      // Don't proceed if there's a ratio error
      return;
    }

    try {
      setIsLoading(true);
      const croppedFile = await getCroppedImg();
      if (croppedFile && onAvatarChange) {
        await onAvatarChange(croppedFile);
      }
      setIsCropping(false);
      setSelectedImage(null);
    } catch (error) {
      console.error("Error saving cropped image:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelCrop = () => {
    setIsCropping(false);
    setSelectedImage(null);
  };

  return (
    <Card className="w-full max-w-md relative">
      <CardHeader>
        <CardTitle className="text-3xl text-center mb-5">Avatar</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4 m-5">
        {isCropping && selectedImage ? (
          <div className="flex flex-col items-center space-y-4 w-full m-20">
            <div className="relative w-full h-[300px]">
              <Cropper image={selectedImage} crop={crop} zoom={zoom} aspect={1} onCropChange={setCrop} onCropComplete={onCropComplete} onZoomChange={setZoom} cropShape="round" showGrid={false} />
            </div>

            <div className="flex items-center w-full max-w-xs space-x-2">
              <ZoomOut className="h-4 w-4 text-muted-foreground" />
              <Slider value={[zoom]} min={1} max={3} step={0.1} onValueChange={(value) => setZoom(value[0])} className="flex-1" />
              <ZoomIn className="h-4 w-4 text-muted-foreground" />
            </div>

            {cropRatioError && <div className="mt-2 p-2 bg-destructive/10 text-destructive rounded-md text-sm">Please maintain a square (1:1) crop ratio for your avatar</div>}

            <div className="flex space-x-2">
              <Button onClick={handleSaveCrop} variant="default" size="sm" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Save
                  </>
                )}
              </Button>
              <Button onClick={handleCancelCrop} variant="outline" size="sm">
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="relative h-44 w-44 rounded-full overflow-hidden border-2 border-border m-10">
            {/* <img src={currentAvatarUrl || "/placeholder.svg"} alt="Current avatar" className="object-cover h-full w-full" width={128} height={128} /> */}
            <Avatar className="object-cover h-full w-full">
              <AvatarImage src={currentAvatarUrl} alt="@shadcn" />
              <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
          </div>
        )}
      </CardContent>
      {!isCropping && (
        <CardFooter className="flex justify-center">
          <Button className="w-full max-w-xs" onClick={() => document.getElementById("avatar-upload")?.click()} disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload New Avatar
              </>
            )}
          </Button>
          <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        </CardFooter>
      )}
      {isLoading && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      )}
    </Card>
  );
}
