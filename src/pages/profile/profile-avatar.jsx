import { useCallback, useEffect, useState } from "react";
import { useStore } from "@/services/StoreContext";
import { authMe, updateAvatar } from "@/services/authService";
import { toast } from "sonner";
import AvatarUploadCard from "./components/avatar-upload-card";
import AvatarRequestChangeCard from "./components/avatar-request-change-card";
import { UploadImageToStorage } from "@/services/uploadImageService";
import { AddStudentRequest, GetStudentLastRequest } from "@/services/studentRequestService";

export default function ProfileAvatar() {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [lastRequest, setLastRequest] = useState(null);
  const { state, dispatch } = useStore();
  const { user, role } = state;

  //Set PreviewURl
  useEffect(() => {
    setPreviewUrl(user.imgUrl);
  }, [user.imgUrl]);

  // Fetch last request
  const fetchLastRequest = useCallback(async () => {
    if (!user?.uid || role.toLowerCase() !== "student") return;

    try {
      const response = await GetStudentLastRequest(user.uid);
      if (response.status === 200 && response.data) {
        setLastRequest(response.data);

        //Check Request Status
        if (response.data.status === 1) {
          //fetch User Data
          const userResponse = await authMe();
          const { imgUrl: fetchAvatar, ...userData } = userResponse.data;

          //compare current with api
          if (fetchAvatar !== previewUrl) {
            setPreviewUrl(fetchAvatar);

            //Set_User with newest data
            const updatedUser = {
              uid: userData.accountId,
              email: userData.email,
              name: userData.fullname,
              phone: userData.phone,
              dob: userData.dob,
              imgUrl: fetchAvatar,
              role: userData.role,
              schedule: userData.schedule,
            };

            const updatedRole = userData.role;
            dispatch({ type: "SET_USER", payload: { user: updatedUser, role: updatedRole } });
          }
        }
      }
    } catch (error) {
      toast.error(error.message || "Request Failed.");
    }
  }, [role, user?.uid, previewUrl, dispatch]);

  useEffect(() => {
    fetchLastRequest();
  }, [fetchLastRequest]);

  //upload avatar
  const handleAvatarChange = async (file) => {
    if (!file) return;

    setIsUploading(true);

    try {
      // Hiển thị trước ảnh tạm thời trên UI
      const previewUrl = URL.createObjectURL(file);
      setPreviewUrl(previewUrl);

      // Upload ảnh lên Cloudinary
      const uploadedImageUrl = await UploadImageToStorage(file);

      if (uploadedImageUrl) {
        // Cập nhật thông tin avatar trên profile
        await updateAvatar(user.name, user.phone, user.dob, uploadedImageUrl);

        // Lấy lại thông tin mới nhất từ server
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

        // Cập nhật Redux state
        dispatch({ type: "SET_USER", payload: { user: userData, role: userData.role } });

        toast.success("Avatar updated successfully!");
      }
    } catch (error) {
      toast.error("Errors occur when uploading avatar!");
    } finally {
      setIsUploading(false);
    }
  };

  //student request change avatar
  const handleAvatarChangeRequest = async (file) => {
    if (!file) {
      toast.error("Vui lòng chọn một ảnh trước khi yêu cầu đổi avatar!");
      return;
    }

    setIsUploading(true);

    try {
      // Hiển thị trước ảnh tạm thời trên UI
      const previewUrl = URL.createObjectURL(file);
      setPreviewUrl(previewUrl);

      // Upload ảnh lên Cloudinary
      const uploadedImageUrl = await UploadImageToStorage(file);
      console.log("upload image: ", uploadedImageUrl);

      if (!uploadedImageUrl) {
        throw new Error("Không thể tải ảnh lên, vui lòng thử lại!");
      }

      // Gửi yêu cầu đổi avatar lên server
      const response = await AddStudentRequest({
        accountId: user.uid,
        imgUrlOld: user.imgUrl,
        imgUrlNew: uploadedImageUrl,
      });

      console.log("addRequest Response: ", response);

      if (response.status === 200) {
        toast.success("Yêu cầu đổi avatar đã được gửi!");
        await fetchLastRequest();
      } else {
        throw new Error(response.message || "Không thể gửi yêu cầu.");
      }
    } catch (error) {
      console.error("Lỗi khi gửi yêu cầu đổi avatar:", error);
      toast.error("Có lỗi xảy ra, vui lòng thử lại!");
    } finally {
      fetchLastRequest();
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto sm:mx-0">
      {role.toLowerCase() !== "student" ? (
        <AvatarUploadCard currentAvatarUrl={previewUrl} onAvatarChange={handleAvatarChange} user={user} />
      ) : (
        <AvatarRequestChangeCard currentAvatarUrl={previewUrl} onRequestChange={handleAvatarChangeRequest} lastRequest={lastRequest} />
      )}
    </div>
  );
}
