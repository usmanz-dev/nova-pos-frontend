import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

const DashboardLayout = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;