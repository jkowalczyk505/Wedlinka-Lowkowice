import { NavLink, Outlet } from "react-router-dom";
import { Package, FileText, Star, Receipt, Beef } from "lucide-react";

export default function AdminPage() {
  return (
    <div className="admin-page-container">
      {/* ── Sidebar ─────────────────────────────────── */}
      <aside className="admin-sidebar">
        <h2>Panel&nbsp;Admina</h2>
        <nav>
          <NavLink
            to="/admin/produkty"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            <Beef size={25} /> Produkty
          </NavLink>
          <NavLink
            to="/admin/zamowienia"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            <FileText size={25} /> Zamówienia
          </NavLink>
          <NavLink
            to="/admin/faktury"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            <Receipt size={25} /> Faktury
          </NavLink>
          <NavLink
            to="/admin/opinie"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            <Star size={25} /> Opinie
          </NavLink>
          <NavLink
            to="/admin/koszty-wysylek"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            <Package size={25} /> Koszty wysyłek
          </NavLink>
        </nav>
      </aside>

      {/* ── Dynamiczna treść ────────────────────────── */}
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
