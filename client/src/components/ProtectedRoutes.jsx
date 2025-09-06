import { useContext } from "react";
import { Navigate } from "react-router-dom";
import AppContext from "../context/AppContext.jsx";


const ProtectedRoute = ({ children, }) => {
  const { isAuthenticated } = useContext(AppContext);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  
  return children;
};

export default ProtectedRoute;
