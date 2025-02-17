import { Spinner } from "@/components/ui/spinner";
import { useStore } from "@/services/StoreContext";
import React, { useEffect, useState } from "react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";

export default function PrivateRoute() {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
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

  return <Outlet />;
}
