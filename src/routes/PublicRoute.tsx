import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import type { ReactNode } from "react";
import { Role } from "@/types/enums";

const PublicRoute = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  if (user && user?.role === Role.ADMIN) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  if (user && user?.role !== Role.ADMIN) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default PublicRoute;
