import { Outlet } from "react-router-dom";

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <Outlet />
    </div>
  );
};

export default AuthLayout;