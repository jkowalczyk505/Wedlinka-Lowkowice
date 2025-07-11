// src/pages/CategoryPage.js
import React, { useEffect, useState } from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import axios from "axios";

import ProductsGrid from "../components/products/ProductsGrid";
import Spinner from "../components/common/Spinner";
import Button from "../components/common/Button";
import Breadcrumbs from "../components/common/Breadcrumbs";

// helpery
import { getCategoryMeta } from "../utils/product";

export default function CategoryPage() {
  const { slug }   = useParams();
  const navigate   = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);

  // meta może być null, ale hooki muszą się wywołać zawsze
  const meta = getCategoryMeta(slug);

  useEffect(() => {
    // jeśli meta nie istnieje, nie pobieramy danych
    if (!meta) return;

    const { apiCategory } = meta;
    setLoading(true);
    setProducts([]);

    axios
      .get(
        `${process.env.REACT_APP_API_URL}/api/products/category/${encodeURIComponent(
          apiCategory
        )}`
      )
      .then((res) => setProducts(res.data))
      .catch((err) => {
        if (err.response?.status === 404) {
          // brak produktów → zostawiamy pustą tablicę
          setProducts([]);
        } else {
          console.error("Błąd ładowania produktów:", err);
        }
      })
      .finally(() => setLoading(false));
  }, [meta]); // uruchom ponownie, gdy zmieni się slug→meta

  // dopiero po hookach możemy przerwać render
  if (!meta) {
    return <Navigate to="/404" replace />;
  }

  const { title } = meta;

  return (
    <main className="page">
      <section className="intro-category-section dark-section">
        <Breadcrumbs
          crumbs={[
            { label: "Strona główna", to: "/" },
            { label: title }       // <-- brak `to` → będzie current
          ]}
        />
        <h1>{title}</h1>
      </section>

      <section className="products-grid-section pattern-section">
        {loading ? (
          <Spinner fullscreen={false} />
        ) : products.length > 0 ? (
          <ProductsGrid products={products} />
        ) : (
          <>
            <p className="no-products">Brak produktów w tej kategorii.</p>
            <Button variant="red" onClick={() => navigate("/sklep")}>
              Przejdź do sklepu
            </Button>
          </>
        )}
      </section>
    </main>
  );
}
