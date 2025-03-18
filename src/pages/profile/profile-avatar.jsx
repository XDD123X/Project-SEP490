import React, { useEffect, useRef, useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useStore } from "@/services/StoreContext";
import { authMe, updateAvatar } from "@/services/authService";
import { toast } from "sonner";

export default function ProfileAvatar() {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(""); // Chỉ hiển thị ảnh preview
  const [selectedFile, setSelectedFile] = useState(null); // Lưu file để upload khi bấm Save
  const fileInputRef = useRef(null);

  const { state, dispatch } = useStore();
  const { user } = state;

  useEffect(() => {
    setPreviewUrl(user.imgUrl); // Load avatar từ user profile
  }, [user.imgUrl]);

  // Khi chọn file: Chỉ hiển thị preview, chưa upload
  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file); // Lưu file để upload sau
    setPreviewUrl(URL.createObjectURL(file)); // Hiển thị preview ngay
  };

  // Khi bấm avatar -> mở file dialog
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  // Khi bấm Save -> Upload ảnh lên Cloudinary + updateProfile
  const handleSave = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      // Upload ảnh lên Cloudinary
      const uploadedImageUrl = await uploadImageToStorage(selectedFile);

      if (uploadedImageUrl) {
        // Update profile với ảnh mới
        await updateAvatar(user.name, user.phone, user.dob, uploadedImageUrl);

        // Gọi authMe để lấy lại thông tin mới nhất
        const userResponse = await authMe();

        if (!userResponse || !userResponse.data) {
          throw new Error("Không thể lấy dữ liệu người dùng");
        }

        const userData = {
          uid: userResponse.data.accountId,
          email: userResponse.data.email,
          name: userResponse.data.fullname,
          phone: userResponse.data.phone,
          dob: userResponse.data.dob,
          imgUrl: uploadedImageUrl, // Gán URL mới trực tiếp
          role: userResponse.data.role,
          schedule: userResponse.data.schedule,
        };

        // Cập nhật state Redux
        dispatch({ type: "SET_USER", payload: { user: userData, role: userData.role } });

        // Hiển thị ngay trên UI
        // setAvatarUrl(uploadedImageUrl);
        setPreviewUrl(uploadedImageUrl);
        setSelectedFile(null);

        toast.success("Avatar Changed!");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Lỗi khi cập nhật avatar!");
    } finally {
      setIsUploading(false);
    }
  };

  // Hàm upload ảnh lên Cloudinary
  const uploadImageToStorage = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "my_preset"); // Thay bằng preset của bạn
    formData.append("cloud_name", "dprozebpx"); // Thay bằng Cloud Name của bạn

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/dprozebpx/image/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      return data.secure_url || null;
    } catch (error) {
      console.error("Error uploading image:", error);
      return null;
    }
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
              {previewUrl ? (
                <img src={previewUrl || "/placeholder.svg"} alt="Avatar" className="object-cover fill" />
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

            <Button onClick={handleSave} disabled={!selectedFile || isUploading} className="w-32">
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Avatar"
              )}
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
