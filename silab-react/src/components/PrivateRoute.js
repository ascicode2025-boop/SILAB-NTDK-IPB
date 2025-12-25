import React from "react";
import { Route, Redirect } from "react-router-dom";
import { getToken, getUser } from "../services/AuthService";


const PrivateRoute = ({ component: Component, allowedRoles, ...rest }) => {
  const token = getToken();
  const user = getUser();

  return (
    <Route
      {...rest}
      render={(props) => {
        
        if (!token) {
          return <Redirect to="/login" />;
        }
        if (allowedRoles && allowedRoles.length > 0) {
            if (!allowedRoles.includes(user?.role)) {
                return <Redirect to="/dashboard" />;
            }
        }

        return <Component {...props} />;
      }}
    />
  );
};

export default PrivateRoute;