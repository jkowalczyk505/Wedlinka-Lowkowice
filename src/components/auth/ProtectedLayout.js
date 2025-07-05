// components/auth/ProtectedLayout.jsx
import { Outlet } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

const ProtectedLayout = () => (
  <ProtectedRoute>
    <Outlet /> {/* <-- tu wchodzi AccountPage */}
  </ProtectedRoute>
);

export default ProtectedLayout;
