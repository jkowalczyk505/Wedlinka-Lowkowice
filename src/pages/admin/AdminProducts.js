// src/pages/admin/AdminProducts.jsx
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Button from "../../components/common/Button";
import AdminProductCategory from "../../components/admin/products/AdminProductCategory";
import Spinner from "../../components/common/Spinner";
import LoadError from "../../components/common/LoadError";
import { IoAddCircle } from "react-icons/io5";
import AdminProductModal from "../../components/admin/products/AdminProductModal";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading,  setLoading] = useState(true);
  const [error,    setError]   = useState(false);

  const [modalOpen,   setModalOpen]   = useState(false);
  const [editedProd,  setEditedProd]  = useState(null);

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

  /* -------------- akcje -------------- */
  const handleAddNew = ()=>{ setEditedProd(null);  setModalOpen(true); };
  const handleEdit   = p  =>{ setEditedProd(p);    setModalOpen(true); };

  const handleDelete = async (p)=>{
    if(!window.confirm(`Usunąć produkt “${p.name}”?`)) return;
    try{
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/products/${p.id}`);
      fetchProducts();
    }catch(err){
      console.error("Błąd usuwania:",err);
      alert("Nie udało się usunąć produktu");
    }
  };

  /* -------------- grupowanie wg kategorii -------------- */
  const grouped = products.reduce((acc, p) => {
    acc[p.category] = acc[p.category] ? [...acc[p.category], p] : [p];
    return acc;
  }, {});

  /* -------------- widok -------------- */
  if (loading) return <Spinner fullscreen={false} />;
  if (error)   return <LoadError onRetry={fetchProducts} />;

  return (
    <div className="admin-products">
      <div className="header-row">
        <h1 className="admin-page-title">Zarządzanie produktami</h1>
        <Button variant="red" onClick={handleAddNew}>
          <IoAddCircle className="btn-icon" />
          <span>Dodaj nowy produkt</span>
        </Button>
      </div>

      {Object.entries(grouped).map(([cat, list]) => (
        <AdminProductCategory
          key={cat}
          title={cat}
          products={list}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ))}

      <AdminProductModal
        key={editedProd?.id ?? "new"}    // <— to sprawi, że przy innej
        open={modalOpen}                 //     wartości editedProd
        initial={editedProd}             //     komponent zostanie ponownie zamontowany
        onClose={()=>setModalOpen(false)}
        onSaved={fetchProducts}
      />
    </div>
  );
}
