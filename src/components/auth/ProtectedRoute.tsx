import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export const ProtectedRoute: React.FC<{ children: React.ReactNode; requireUpload?: boolean }>=({ children, requireUpload })=>{
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (requireUpload && !user.hasUploaded) return <Navigate to="/upload" replace />;
  return <>{children}</>;
};
