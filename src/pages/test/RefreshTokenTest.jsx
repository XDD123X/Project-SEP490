import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import axiosClient, { getAccessToken, setAccessToken } from "@/services/axiosClient";
import React, { useState } from "react";
import { toast } from "sonner";

export default function RefreshTokenTest() {
  const [responseMessage, setResponseMessage] = useState("");

  const testApi = async () => {
    try {
      const res = await axiosClient.get("/auth/me"); // API yêu cầu xác thực
      console.log("response: ", res.data.accountId);

      setResponseMessage(`Success: ${res.data.accountId}`);
      toast.success("Request thành công!");
    } catch (error) {
      setResponseMessage(`Error: ${error.response?.data?.message || "Unknown error"}`);
      toast.error("Có lỗi xảy ra!");
    }
  };

  // Hàm giả lập token hết hạn để kiểm tra refresh
  const expireToken = () => {
    setAccessToken("expired-token"); // Gán accessToken giả để mô phỏng hết hạn
    toast.info("AccessToken đã bị thay đổi để test refresh!");
  };

  const getAccessTokenHandler = () => {
    var token = getAccessToken();
    setResponseMessage(token);
  };

  return (
    <>
      <div className="flex flex-col items-center gap-4 p-6">
        <h1 className="text-xl font-bold">Test Refresh Token</h1>
        <Button onClick={testApi}>Gửi Request Test</Button>
        <Button variant="outline" onClick={expireToken}>
          Giả lập AccessToken hết hạn
        </Button>
        <Button onClick={getAccessTokenHandler}>Get access_token from memory</Button>
        <p className="mt-4 p-2 border rounded">{responseMessage}</p>
      </div>
    </>
  );
}
