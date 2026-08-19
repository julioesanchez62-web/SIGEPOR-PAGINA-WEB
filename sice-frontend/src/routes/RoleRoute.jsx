import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function RoleRoute({ allowedRoles, children }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.idRol)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default RoleRoute;
