import { NavLink, Outlet } from "react-router-dom";
import {
  Package,
  FileText,
  Star,
  Receipt,
  Home
} from "lucide-react";

export default function AdminPage() {
  return (
    <div className="admin-page-container white-section">
      {/* ── Sidebar ─────────────────────────────────── */}
      <aside className="admin-sidebar">
        <h2>Panel&nbsp;Admina</h2>
        <nav>
          <NavLink to="/admin" end className={({isActive})=>isActive?"nav-link active":"nav-link"}>
            <Home size={24}/>  Dashboard
          </NavLink>
          <NavLink to="/admin/produkty"    className={({isActive})=>isActive?"nav-link active":"nav-link"}>
            <Package size={24}/> Produkty
          </NavLink>
          <NavLink to="/admin/zamowienia" className={({isActive})=>isActive?"nav-link active":"nav-link"}>
            <FileText size={24}/> Zamówienia
          </NavLink>
          <NavLink to="/admin/opinie"     className={({isActive})=>isActive?"nav-link active":"nav-link"}>
            <Star size={24}/>  Opinie
          </NavLink>
          <NavLink to="/admin/faktury"    className={({isActive})=>isActive?"nav-link active":"nav-link"}>
            <Receipt size={24}/> Faktury
          </NavLink>
        </nav>
      </aside>

      {/* ── Dynamiczna treść ────────────────────────── */}
      <main className="admin-main">
        <Outlet/>
      </main>
    </div>
  );
}
