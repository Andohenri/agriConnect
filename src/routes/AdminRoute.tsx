import { type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Role } from "@/types/enums";
import { Loader2 } from "lucide-react";

const AdminRoute = ({ children }: { children: ReactNode }) => {
  const { loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin mx-auto text-green-600 mb-4" />
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
