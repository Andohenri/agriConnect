import { type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Role } from "@/types/enums";

const AdminRoute = ({ children }: { children: ReactNode }) => {
  const { loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return <Navigate to="/sign-in" replace />;
  }
  if (user && user?.role !== Role.ADMIN) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default AdminRoute;
