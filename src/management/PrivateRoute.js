import { Navigate } from "react-router-dom";
// import { useAuth } from './spotify';
import { getToken } from "./browserStorage";

const PrivateRoute = ({ children }) => {
  // const { token } = useAuth();

  if (getToken() == null) {
    console.log(getToken());
    return <Navigate to="/login" />;
  }
  return children;
};

export default PrivateRoute;
