import { Spinner } from "@/components/ui/spinner";
import { useStore } from "@/services/StoreContext";
import React, { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";

export default function PrivateRoute() {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation(); // Lấy đường dẫn hiện tại
  const { state } = useStore();
  const { user, role } = state;
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  useEffect(() => {
    const checkUser = async () => {
      await delay(500);
      if (!user) {
        navigate("/login", { replace: true });
      } else {
        setIsLoading(false);
      }
    };

    checkUser();
  }, [user, navigate]);

  if (isLoading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <Spinner />
      </div>
    );
  }

  // Nếu user đã có, giữ nguyên đường dẫn đang truy cập
  return <Outlet />;
}
