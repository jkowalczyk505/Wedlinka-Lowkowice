// src/pages/ProductsPageLayout.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ProductsGrid from "../components/products/ProductsGrid";
import Spinner from "../components/common/Spinner";
import LoadError from "../components/common/LoadError";
import Button from "../components/common/Button";
import Breadcrumbs from "../components/common/Breadcrumbs";
import SortDropdown from "../components/common/SortDropdown";

export default function ProductsPageLayout({ title, fetchUrl, isAllProductsPage = false }) {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("date_desc");
  const [error, setError] = useState(false);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError(false);
    setProducts([]);

    axios
      .get(`${fetchUrl}?sort=${sort}`)
      .then((res) => setProducts(res.data))
      .catch((err) => {
        console.error("Błąd ładowania produktów:", err);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, [fetchUrl, sort, reloadTrigger]);

  return (
    <main className="page">
      <section className="intro-category-section dark-section">
        <div className="intro-header">
          <div className="breadcrumbs-wrapper">
           <Breadcrumbs
            crumbs={[
                { label: "Strona główna", to: "/" },
                isAllProductsPage
                ? { label: "Sklep" } // nieklikalny
                : { label: "Sklep", to: "/sklep" },
                // tylko jeśli NIE jesteśmy na stronie ogólnej
                ...(!isAllProductsPage ? [{ label: title }] : [])
            ]}
            />
          </div>
          <h1>{title}</h1>
          <div className="sort-wrapper">
            <SortDropdown
              value={sort}
              options={[
                { value: "date_desc", label: "Najnowsze" },
                { value: "date_asc", label: "Najstarsze" },
                { value: "price_asc", label: "Cena ↑" },
                { value: "price_desc", label: "Cena ↓" },
                { value: "name_asc", label: "Nazwa A–Z" },
                { value: "name_desc", label: "Nazwa Z–A" },
              ]}
              onChange={(value) => setSort(value)}
            />
          </div>
        </div>
      </section>

      <section className="products-grid-section pattern-section">
        {loading ? (
          <Spinner fullscreen={false} />
        ) : error ? (
          <LoadError onRetry={() => setReloadTrigger((x) => x + 1)} />
        ) : products.length > 0 ? (
          <ProductsGrid products={products} />
        ) : (
          <>
            <p className="no-products">Brak produktów do wyświetlenia.</p>
            <Button variant="red" onClick={() => navigate("/")}>
              Wróć do strony głównej
            </Button>
          </>
        )}
      </section>
    </main>
  );
}
