import { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PrivateRoute = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  
  // if (!user) {
  //   return <Navigate to="/sign-in" replace />;
  // }
  
  return children;
};

export default PrivateRoute;