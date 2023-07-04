import { Navigate } from "react-router-dom";
import { getToken } from "./browserStorage";

const PrivateRoute = ({ children }) => {
  if (getToken() == null) {
    return <Navigate to="/login" />;
  }
  return children;
};

export default PrivateRoute;
