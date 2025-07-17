// src/pages/admin/AdminProducts.jsx
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { AuthFetch } from "../../components/auth/AuthFetch";
import Button from "../../components/common/Button";
import AdminProductCategory from "../../components/admin/products/AdminProductCategory";
import Spinner from "../../components/common/Spinner";
import LoadError from "../../components/common/LoadError";
import ConfirmAlert from "../../components/common/alert/ConfirmAlert";
import { IoAddCircle } from "react-icons/io5";
import AdminProductModal from "../../components/admin/products/AdminProductModal";
import { useAlert } from "../../components/common/alert/AlertContext";

export default function AdminProducts() {
  const { showAlert } = useAlert();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editedProd, setEditedProd] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  const fetchProducts = useCallback(() => {
    setLoading(true);
    setError(false);
    axios
      .get(`${process.env.REACT_APP_API_URL}/api/products?sort=name_asc`)
      .then(res => setProducts(res.data))
      .catch(err => {
        console.error("Błąd pobierania produktów:", err);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(fetchProducts, [fetchProducts]);

  // otwarcie modalu
  const handleAddNew = () => {
    setEditedProd(null);
    setModalOpen(true);
  };
  const handleEdit = prod => {
    setEditedProd(prod);
    setModalOpen(true);
  };

  // potwierdzenie usunięcia
  const confirmDelete = prod => setToDelete(prod);
  const cancelDelete = () => setToDelete(null);
  const doDelete = async () => {
    if (!toDelete) return;
    try {
      const url = `${process.env.REACT_APP_API_URL}/api/products/${toDelete.id}`;
      const res = await AuthFetch(url, { method: "DELETE" });
      if (!res.ok) {
        let msg = "Nie udało się usunąć produktu";
        try {
          const body = await res.json();
          if (body.error) msg = body.error;
        } catch {}
        throw new Error(msg);
      }
      showAlert(`Produkt „${toDelete.name}” usunięty`, "info");
      fetchProducts();
    } catch (err) {
      console.error("Błąd usuwania:", err);
      showAlert(err.message || "Nie udało się usunąć produktu", "error");
    } finally {
      setToDelete(null);
    }
  };

  // grupowanie
  const grouped = products.reduce((acc, prod) => {
    acc[prod.category] = acc[prod.category]
      ? [...acc[prod.category], prod]
      : [prod];
    return acc;
  }, {});

  if (loading) return <Spinner fullscreen={false} />;
  if (error) return <LoadError onRetry={fetchProducts} />;

  return (
    <div className="admin-products">
      <div className="header-row">
        <h1 className="admin-page-title">Zarządzanie produktami</h1>
        <Button variant="red" onClick={handleAddNew}>
          <IoAddCircle className="btn-icon" />
          <span>Dodaj nowy produkt</span>
        </Button>
      </div>

      {Object.entries(grouped).map(([category, list]) => (
        <AdminProductCategory
          key={category}
          title={category}
          products={list}
          onEdit={handleEdit}
          onDelete={confirmDelete}
        />
      ))}

      {toDelete && (
        <ConfirmAlert
          message={`Usunąć produkt „${toDelete.name}”?`}
          onConfirm={doDelete}
          cancelButtonText="Anuluj"
          onClose={cancelDelete}
          confirmButtonText="Usuń"
        />
      )}

      <AdminProductModal
        key={editedProd?.id ?? "new"}
        open={modalOpen}
        initial={editedProd}
        onClose={() => setModalOpen(false)}
        onSaved={fetchProducts}
      />
    </div>
  );
}
