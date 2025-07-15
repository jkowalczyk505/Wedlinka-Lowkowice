// components/auth/AdminLayout.jsx
import { Outlet } from "react-router-dom";
import AdminRoute from "./AdminRoute";

const AdminLayout = () => (
  <AdminRoute>
    <Outlet /> {/* <-- tu wchodzi AdminPage */}
  </AdminRoute>
);

export default AdminLayout;
