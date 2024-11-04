import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const ProtectRoute = ({ children, onOpen,user, redirect = "/" }) => {
  if (!user) {
    onOpen()
    return <Navigate to={redirect} />;
  }

  return children ? children : <Outlet />;
};

export default ProtectRoute;
