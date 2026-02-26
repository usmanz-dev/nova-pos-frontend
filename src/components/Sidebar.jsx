import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import {
  FaTachometerAlt,
  FaBoxOpen,
  FaFolderOpen,
  FaBalanceScale,
  FaFileAlt,
  FaShoppingBag,
  FaFileInvoiceDollar,
  FaExchangeAlt,
  FaMoneyBillWave,
  FaUsers,
  FaUserShield,
  FaWarehouse,
  FaChartBar,
  FaStore,
  FaMoneyCheckAlt,
  FaGlobe,
  FaLayerGroup,
  FaCreditCard,
  FaUser,
  FaArrowLeft,
  FaArrowRight,
  FaBars,
  FaTimes,
} from "react-icons/fa";

import icon from "../assets/icon.png";

// Admin menu
const adminMenu = [
  { label: "Dashboard", path: "/admin/dashboard", icon: <FaTachometerAlt /> },
  { label: "Products", path: "/admin/products", icon: <FaBoxOpen /> },
  { label: "Categories", path: "/admin/categories", icon: <FaFolderOpen /> },
  { label: "Adjustments", path: "/admin/adjustments", icon: <FaBalanceScale /> },
  { label: "Purchases", path: "/admin/purchases", icon: <FaShoppingBag /> },
  { label: "Sales", path: "/admin/sales", icon: <FaFileInvoiceDollar /> },
  { label: "Expenses", path: "/admin/expenses", icon: <FaMoneyBillWave /> },
  { label: "Peoples", path: "/admin/peoples", icon: <FaUsers /> },
  { label: "Roles & Permissions", path: "/admin/roles", icon: <FaUserShield /> },
  { label: "Reports", path: "/admin/reports", icon: <FaChartBar /> },
  { label: "Currencies", path: "/admin/currencies", icon: <FaMoneyCheckAlt /> },
  { label: "Payment Methods", path: "/admin/payment-methods", icon: <FaCreditCard /> },
  { label: "Profile", path: "/admin/profile", icon: <FaUser /> },
];

// Cashier menu
const cashierMenu = [
  { label: "Dashboard", path: "/cashier/dashboard", icon: <FaTachometerAlt /> },
  { label: "POS", path: "/cashier/pos", icon: <FaShoppingBag /> },
  { label: "Sales", path: "/cashier/sales", icon: <FaFileInvoiceDollar /> },
  { label: "Profile", path: "/cashier/profile", icon: <FaUser /> },
];

// Inventory menu
const inventoryMenu = [
  { label: "Dashboard", path: "/inventory/dashboard", icon: <FaTachometerAlt /> },
  { label: "Products", path: "/inventory/products", icon: <FaBoxOpen /> },
  { label: "Adjustments", path: "/inventory/adjustments", icon: <FaBalanceScale /> },
  { label: "Profile", path: "/inventory/profile", icon: <FaUser /> },
];

const Sidebar = ({ collapsed, setCollapsed }) => {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const menu =
    user?.role === "admin"
      ? adminMenu
      : user?.role === "cashier"
      ? cashierMenu
      : inventoryMenu;

  return (
    <>
      {/* ══════════════════════════════════════
          DESKTOP (md aur upar)
      ══════════════════════════════════════ */}
      <aside
        className={`
          hidden md:flex flex-col bg-gray-100 text-gray-900 h-full
          transition-all duration-300 ease-in-out border-r border-gray-300
          shadow-lg shadow-gray-400/30
          ${collapsed ? "w-[68px]" : "w-64"}
        `}
      >
        {/* Header */}
        <div
          className={`
            flex items-center border-b border-gray-300 
            ${collapsed ? "justify-center px-0 py-4" : "justify-between px-4 py-4"}
          `}
        >
          {!collapsed && (
            <div className="overflow-hidden">
              <div className="flex items-center gap-2">
                <img src={icon} alt="Nova POS Logo" className="w-8 h-8 object-contain" />
                <h2 className="text-lg font-bold tracking-wide whitespace-nowrap text-gray-900">
                  Nova POS
                </h2>
              </div>
              <p className="text-xs text-gray-600 capitalize">{user?.role} Panel</p>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`
               w-8 h-8 rounded-lg bg-gray-300 hover:bg-gray-400
              flex items-center justify-center transition text-gray-900 text-sm font-bold
              ${collapsed ? "mx-auto" : ""}
            `}
            title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {collapsed ? <FaArrowRight className="text-sm" /> : <FaArrowLeft className="text-sm" />}
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto sidebar-scroll">
          {menu.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `relative group flex items-center rounded-xl text-sm font-medium transition-all duration-150
                ${collapsed ? "justify-center px-0 py-3" : "gap-3 px-3 py-2.5"}
                ${isActive
                  ? "bg-gray-800 text-white"
                  : "text-gray-700 hover:bg-gray-200 hover:text-black"
                }`
              }
            >
              <span className={` text-lg leading-none ${collapsed ? "text-xl" : "text-base"}`}>
                {item.icon}
              </span>
              {!collapsed && <span className="truncate">{item.label}</span>}
              {collapsed && (
                <span className="absolute left-16 whitespace-nowrap bg-gray-800 text-white text-xs px-3 py-1.5 rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 shadow-md">
                  {item.label}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Section */}
        {!collapsed ? (
          <div className="px-4 py-4 border-t border-gray-300 ">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-800 text-white flex items-center justify-center font-bold text-sm">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                <p className="text-xs text-gray-600 truncate">{user?.email}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-4 border-t border-gray-300 flex justify-center ">
            <div className="w-8 h-8 rounded-full bg-gray-800 text-white flex items-center justify-center font-bold text-sm">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        )}
      </aside>

      {/* ══════════════════════════════════════
          MOBILE (md se neeche)
      ══════════════════════════════════════ */}
      <div className="md:hidden">

        {/* Dark overlay — drawer ke peeche */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Slide-in Drawer */}
        <div
          className={`
            fixed top-0 left-0 h-full z-50
            transition-transform duration-300 ease-in-out
            ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          `}
        >
          <aside className="bg-gray-100 text-gray-900 flex flex-col h-full w-64 border-r border-gray-300 shadow-lg shadow-gray-400/30">

            {/* 
              Drawer Header:
              - Left: logo + brand name
              - Right: Cross button (sidebar band karo)
            */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-300 ">
              <div className="flex items-center gap-2 overflow-hidden">
                <img src={icon} alt="Nova POS Logo" className="w-8 h-8 object-contain " />
                <div className="overflow-hidden">
                  <h2 className="text-lg font-bold tracking-wide whitespace-nowrap text-gray-900">
                    Nova POS
                  </h2>
                  <p className="text-xs text-gray-600 capitalize">{user?.role} Panel</p>
                </div>
              </div>
              {/* Cross button — sidebar band karne ke liye, header ke andar right side */}
              <button
                onClick={() => setMobileOpen(false)}
                className=" w-8 h-8 rounded-lg bg-gray-300 hover:bg-gray-400 flex items-center justify-center transition text-gray-900 text-sm font-bold"
                title="Close Menu"
              >
                <FaTimes />
              </button>
            </div>

            {/* Menu */}
            <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto sidebar-scroll">
              {menu.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                    ${isActive
                      ? "bg-gray-800 text-white"
                      : "text-gray-700 hover:bg-gray-200 hover:text-black"
                    }`
                  }
                >
                  <span className=" text-base">{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </NavLink>
              ))}
            </nav>

            {/* User Section */}
            <div className="px-4 py-4 border-t border-gray-300 ">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-800 text-white flex items-center justify-center font-bold text-sm">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                  <p className="text-xs text-gray-600 truncate">{user?.email}</p>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/*
          Hamburger button — sirf tab dikhao jab drawer band ho
          Drawer khulne ke baad yeh hide ho jata hai (cross button drawer header mein hai)
        */}
        {!mobileOpen && (
          <button
            onClick={() => setMobileOpen(true)}
            className="fixed top-3 left-3 z-50 w-9 h-9 rounded-lg bg-gray-800 text-white flex items-center justify-center shadow-md"
            title="Open Menu"
          >
            <FaBars />
          </button>
        )}
      </div>
    </>
  );
};

export default Sidebar;