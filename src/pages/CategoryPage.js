// src/pages/CategoryPage.js
import React, { useEffect, useState } from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import axios from "axios";

import ProductsGrid from "../components/products/ProductsGrid";
import Spinner from "../components/common/Spinner";
import Button from "../components/common/Button";
import Breadcrumbs from "../components/common/Breadcrumbs";
import SortDropdown from "../components/common/SortDropdown";

// helpery
import { getCategoryMeta } from "../utils/product";

export default function CategoryPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("default"); // ← stan sortowania

  const meta = getCategoryMeta(slug);
  useEffect(() => {
    if (!meta) return;
    const { apiCategory } = meta;
    setLoading(true);
    setProducts([]);
    axios
      .get(
        `${
          process.env.REACT_APP_API_URL
        }/api/products/category/${encodeURIComponent(apiCategory)}?sort=${sort}` // ← możesz podłączyć query sort
      )
      .then((res) => setProducts(res.data))
      .catch((err) => {
        if (err.response?.status === 404) setProducts([]);
        else console.error("Błąd ładowania produktów:", err);
      })
      .finally(() => setLoading(false));
  }, [meta, sort]); // ← reload na zmianę sort

  if (!meta) return <Navigate to="/404" replace />;

  const { title } = meta;

  return (
    <main className="page">
      <section className="intro-category-section dark-section">
        <div className="intro-header">
          <div className="breadcrumbs-wrapper">
            <Breadcrumbs
              crumbs={[{ label: "Strona główna", to: "/" }, { label: title }]}
            />
          </div>

          <h1>{title}</h1>

          <div className="sort-wrapper">
            <SortDropdown
              value={sort}
              options={[
                { value: "default", label: "Domyślnie" },
                { value: "price-asc", label: "Cena ↑" },
                { value: "price-desc", label: "Cena ↓" },
                { value: "name-asc", label: "Nazwa A–Z" },
                { value: "name-desc", label: "Nazwa Z–A" },
              ]}
              onChange={(e) => setSort(e.target.value)}
            />
          </div>
        </div>
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
