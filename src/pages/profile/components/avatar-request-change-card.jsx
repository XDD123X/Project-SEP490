import { useState, useCallback } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserRound, Check, X, ArrowRight, ZoomIn, ZoomOut, Clock, CheckCircle, XCircle } from "lucide-react";
import Cropper from "react-easy-crop";
import { Slider } from "@/components/ui/slider";
import { format } from "date-fns";
import { toast } from "sonner";

export default function AvatarRequestChangeCard({ currentAvatarUrl, lastRequest, onRequestChange }) {
  const [isRequesting, setIsRequesting] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [requestSubmitted, setRequestSubmitted] = useState(false);
  const [newAvatarPreview, setNewAvatarPreview] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cropRatioError, setCropRatioError] = useState(false);

  // Determine if there's a pending request
  const hasPendingRequest = lastRequest && lastRequest.status === 0;
  

  // Format date helper function
  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      return format(new Date(dateString), "dd/MM/yyyy 'at' h:mm a");
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  };

  const handleRequestChange = () => {
    // If there's already a pending request, show a toast
    if (hasPendingRequest) {
      toast.warning("You must wait for an officer to review your current request before making a new one.");
      return;
    }
    setIsRequesting(true);
  };

  //handle file change
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onload = () => {
        setSelectedImage(reader.result);
        setZoom(1);
        setCrop({ x: 0, y: 0 });
      };

      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);

    // Check if the crop aspect ratio is close to 1:1
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

      // Create a URL for preview
      const dataUrl = canvas.toDataURL("image/png");
      setNewAvatarPreview(dataUrl);

      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          if (!blob) return;
          const file = new File([blob], "avatar-request.png", { type: "image/png" });
          resolve(file);
        }, "image/png");
      });
    } catch (e) {
      console.error("Error creating cropped image:", e);
      return null;
    }
  };

  const handleSubmitRequest = async () => {
    if (cropRatioError) {
      // Don't proceed if there's a ratio error
      return;
    }

    try {
      setIsLoading(true);
      const croppedFile = await getCroppedImg();
      if (croppedFile && onRequestChange) {
        await onRequestChange(croppedFile);
        setRequestSubmitted(true);
      }
      setIsRequesting(false);
    } catch (error) {
      console.error("Error processing avatar change request:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelRequest = () => {
    setIsRequesting(false);
    setSelectedImage(null);
  };

  const handleNewRequest = () => {
    // If there's already a pending request, show a toast
    if (hasPendingRequest) {
      toast({
        title: "Request Already Pending",
        description: "You must wait for an officer to review your current request before making a new one.",
        variant: "destructive",
      });
      return;
    }

    setRequestSubmitted(false);
    setNewAvatarPreview(null);
    setSelectedImage(null);
  };

  // Render the appropriate content based on lastRequest status
  const renderRequestContent = () => {
    // If we're in the requesting state, show the cropper
    if (isRequesting) {
      if (selectedImage) {
        return (
          <div className="flex flex-col items-center space-y-4 w-full m-20">
            <div className="relative w-full h-[400px]">
              <Cropper image={selectedImage} crop={crop} zoom={zoom} aspect={1} onCropChange={setCrop} onCropComplete={onCropComplete} onZoomChange={setZoom} cropShape="round" showGrid={false} />
            </div>

            <div className="flex items-center w-full max-w-xs space-x-2">
              <ZoomOut className="h-4 w-4 text-muted-foreground" />
              <Slider value={[zoom]} min={1} max={3} step={0.1} onValueChange={(value) => setZoom(value[0])} className="flex-1" />
              <ZoomIn className="h-4 w-4 text-muted-foreground" />
            </div>

            {cropRatioError && <div className="mt-2 p-2 bg-destructive/10 text-destructive rounded-md text-sm">Please maintain a square (1:1) crop ratio for your avatar</div>}

            <div className="flex space-x-2">
              <Button onClick={handleSubmitRequest} variant="default" size="sm" disabled={isLoading || cropRatioError}>
                {isLoading ? (
                  <>
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Submit Request
                  </>
                )}
              </Button>
              <Button onClick={handleCancelRequest} variant="outline" size="sm">
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </div>
          </div>
        );
      } else {
        return (
          <div className="flex flex-col items-center space-y-4 m-10 mb-20">
            <Button onClick={() => document.getElementById("avatar-request-upload")?.click()} disabled={isLoading} className='w-full'>
              {isLoading ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                  Processing...
                </>
              ) : (
                "Select New Avatar"
              )}
            </Button>
            <Button variant="outline" onClick={handleCancelRequest} className='w-full'>
              Cancel Request
            </Button>
            <input id="avatar-request-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </div>
        );
      }
    }

    // If there's a pending request (status 0)
    if (hasPendingRequest) {
      return (
        <div className="flex flex-col items-center space-y-4 m-6">
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="relative h-44 w-44 rounded-full overflow-hidden border-2 border-border">
              <img src={lastRequest.imgUrlOld || currentAvatarUrl} alt="Current avatar" className="object-cover w-full h-full" width={128} height={128} />
            </div>

            <ArrowRight className="h-8 w-8 text-primary" />

            <div className="relative h-44 w-44 rounded-full overflow-hidden border-2 border-border">
              <img src={lastRequest.imgUrlNew || "/placeholder.svg"} alt="Requested avatar" className="object-cover w-full h-full" width={128} height={128} />
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-amber-800 text-sm w-full">
            <p className="font-medium flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              Your request is pending approval
            </p>
            <p>An officer will review your avatar change request soon.</p>
          </div>
        </div>
      );
    }

    // If there's a completed request (status 1 - approved or 2 - rejected)
    if (lastRequest && (lastRequest.status === 1 || lastRequest.status === 2)) {
      const isApproved = lastRequest.status === 1;

      return (
        <div className="flex flex-col items-center space-y-4">
          <div className="relative h-40 w-40 rounded-full overflow-hidden border-2 border-border">
            <img src={currentAvatarUrl || "/placeholder.svg"} alt="Current avatar" className="object-cover w-full h-full" width={160} height={160} />
          </div>

          <div className={`border rounded-md p-3 text-sm w-full ${isApproved ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"}`}>
            <p className="font-medium flex items-center">
              {isApproved ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Your avatar change request was approved
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-1" />
                  Your avatar change request was rejected
                </>
              )}
            </p>

            <div className="mt-2 space-y-1 text-xs">
              <p>
                <span className="font-medium">Processed by:</span> {lastRequest.approvedByNavigation?.fullName || "Unknown"}
              </p>
              <p>
                <span className="font-medium">Date:</span> {formatDate(lastRequest.approvedDate)}
              </p>
              {!isApproved && lastRequest.description && (
                <p>
                  <span className="font-medium">Reason:</span> {lastRequest.description}
                </p>
              )}
            </div>
          </div>

          <Button className="w-full max-w-xs" onClick={handleRequestChange}>
            <UserRound className="mr-2 h-4 w-4" />
            Make New Request
          </Button>
        </div>
      );
    }

    // Default state - no request yet
    if (requestSubmitted && newAvatarPreview) {
      return (
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center justify-center space-x-4">
            <div className="relative h-32 w-32 rounded-full overflow-hidden border-2 border-border">
              <img src={currentAvatarUrl || "/placeholder.svg"} alt="Current avatar" className="object-cover w-full h-full" width={128} height={128} />
            </div>

            <ArrowRight className="h-8 w-8 text-primary" />

            <div className="relative h-32 w-32 rounded-full overflow-hidden border-2 border-border">
              <img src={newAvatarPreview || "/placeholder.svg"} alt="Requested avatar" className="object-cover w-full h-full" width={128} height={128} />
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-amber-800 text-sm w-full">
            <p className="font-medium flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              Your request is pending approval
            </p>
            <p>An officer will review your avatar change request soon.</p>
          </div>
        </div>
      );
    }

    // Initial state - show current avatar
    return (
      <div className="relative h-44 w-44 rounded-full overflow-hidden border-2 border-border m-10">
        <img src={currentAvatarUrl || "/placeholder.svg"} alt="Current avatar" className="object-cover w-full h-full" width={160} height={160} />
      </div>
    );
  };
  
  // Determine what to show in the card header
  const renderCardHeader = () => {
    if (lastRequest) {
      if (lastRequest.status === 0) {
        return (
          <CardDescription className="text-amber-500 flex items-center justify-center">
            <Clock className="h-4 w-4 mr-1" />
            Your avatar change request is pending approval
          </CardDescription>
        );
      } else if (lastRequest.status === 1) {
        return (
          <CardDescription className="text-green-600 flex items-center justify-center">
            <CheckCircle className="h-4 w-4 mr-1" />
            Your last avatar change request was approved
          </CardDescription>
        );
      } else if (lastRequest.status === 2) {
        return (
          <CardDescription className="text-red-600 flex items-center justify-center">
            <XCircle className="h-4 w-4 mr-1" />
            Your last avatar change request was rejected
          </CardDescription>
        );
      }
    }

    if (!isRequesting && !requestSubmitted) {
      return <CardDescription className='m-'>Request to change your profile avatar</CardDescription>;
    }

    if (requestSubmitted) {
      return (
        <CardDescription className="text-amber-500 flex items-center">
          <Clock className="h-4 w-4 mr-1" />
          Your avatar change request is pending approval
        </CardDescription>
      );
    }

    return null;
  };

  // Determine if we should show the request button
  const shouldShowRequestButton = !isRequesting && !hasPendingRequest && !requestSubmitted && (lastRequest === null || lastRequest?.status === 0);

  return (
    <Card className="w-full max-w-md relative">
      <CardHeader>
        <CardTitle className="text-3xl text-center mb-5">Avatar</CardTitle>
        {renderCardHeader()}
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">{renderRequestContent()}</CardContent>
      {shouldShowRequestButton && (
        <CardFooter className="flex justify-center">
          <Button className="w-full max-w-xs" onClick={handleRequestChange} disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                Processing...
              </>
            ) : (
              <>
                <UserRound className="mr-2 h-4 w-4" />
                Request Avatar Change
              </>
            )}
          </Button>
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
