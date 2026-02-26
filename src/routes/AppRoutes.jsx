import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

// Layouts
import DashboardLayout from "../layouts/DashboardLayout";

// Auth
import Login from "../pages/auth/Login";

// Profile (shared)
import Profile from "../pages/Profile";

// Admin Pages
import AdminDashboard from "../pages/admin/Dashboard";
import AdminProducts from "../pages/admin/Products";
import AdminSales from "../pages/admin/Sales";
import AdminAdjustments from "../pages/admin/Adjustments";
import AdminQuotations from "../pages/admin/Quotations";
import AdminPurchases from "../pages/admin/Purchases";
import AdminTransfers from "../pages/admin/Transfers";
import AdminExpenses from "../pages/admin/Expenses";
import AdminPeoples from "../pages/admin/Peoples";
import AdminRoles from "../pages/admin/RolesPermissions";
import AdminWarehouse from "../pages/admin/Warehouse";
import AdminReports from "../pages/admin/Reports";
import AdminStores from "../pages/admin/Stores";
import AdminCurrencies from "../pages/admin/Currencies";
import AdminLanguages from "../pages/admin/Languages";
import AdminTemplates from "../pages/admin/Templates";
import AdminPaymentMethods from "../pages/admin/PaymentMethods";
import AdminCategories from "../pages/admin/Categories";

// Cashier Pages
import CashierDashboard from "../pages/cashier/Dashboard";
import CashierPOS from "../pages/cashier/POS";
import CashierSales from "../pages/cashier/Sales";

// Inventory Pages
import InventoryDashboard from "../pages/inventory/Dashboard";
import InventoryProducts from "../pages/inventory/Products";
import InventoryAdjustments from "../pages/inventory/Adjustments";

const AppRoutes = () => {
  return (
    <Routes>

      {/* Public Route */}
      <Route path="/login" element={<Login />} />

      {/* Default Redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* ======================== */}
      {/* Admin Routes             */}
      {/* ======================== */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={["admin"]}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="sales" element={<AdminSales />} />
        <Route path="adjustments" element={<AdminAdjustments />} />
        <Route path="quotations" element={<AdminQuotations />} />
        <Route path="purchases" element={<AdminPurchases />} />
        <Route path="transfers" element={<AdminTransfers />} />
        <Route path="expenses" element={<AdminExpenses />} />
        <Route path="peoples" element={<AdminPeoples />} />
        <Route path="roles" element={<AdminRoles />} />
        <Route path="warehouse" element={<AdminWarehouse />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="stores" element={<AdminStores />} />
        <Route path="currencies" element={<AdminCurrencies />} />
        <Route path="languages" element={<AdminLanguages />} />
        <Route path="templates" element={<AdminTemplates />} />
        <Route path="payment-methods" element={<AdminPaymentMethods />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* ======================== */}
      {/* Cashier Routes           */}
      {/* ======================== */}
      <Route
        path="/cashier"
        element={
          <ProtectedRoute roles={["cashier"]}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<CashierDashboard />} />
        <Route path="pos" element={<CashierPOS />} />
        <Route path="sales" element={<CashierSales />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* ======================== */}
      {/* Inventory Routes         */}
      {/* ======================== */}
      <Route
        path="/inventory"
        element={
          <ProtectedRoute roles={["inventory"]}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<InventoryDashboard />} />
        <Route path="products" element={<InventoryProducts />} />
        <Route path="adjustments" element={<InventoryAdjustments />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* 404 - Unknown Routes */}
      <Route path="*" element={<Navigate to="/login" replace />} />

    </Routes>
  );
};

export default AppRoutes;