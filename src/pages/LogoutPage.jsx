import { Spinner } from "@/components/ui/spinner";
import { logout } from "@/services/authService";
import { useStore } from "@/services/StoreContext";
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function LogoutPage() {
  const { dispatch } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch({ type: "LOGOUT" });
    // logout();
    navigate("/login");
  }, [navigate, dispatch]);

  return (
    <div className="absolute inset-0 flex items-center justify-center z-10">
      <Spinner />
    </div>
  );
}
