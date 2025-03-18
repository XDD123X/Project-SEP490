import { useStore } from "@/services/StoreContext";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ allowedRoles }) => {
    const { state } = useStore();
    const { user, role } = state;

    if (!user || !allowedRoles.includes(role.toLowerCase())) {
        return <Navigate to="/404" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
