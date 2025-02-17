/* eslint-disable react/prop-types */
import { Navigate, Outlet } from "react-router-dom";
import { useStore } from "@/services/StoreContext";
import { useEffect, useState } from "react";
import { Spinner } from "@/components/ui/spinner";

const LecturerPrivateRoute = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { state } = useStore();
  const { user, role } = state;

  useEffect(() => {
    if (user) {
      setIsLoading(false);
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <Spinner />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (role !== "Lecturer") {
    return <Navigate to="/404" />;
  }
  return <Outlet />;
};

export default LecturerPrivateRoute;
