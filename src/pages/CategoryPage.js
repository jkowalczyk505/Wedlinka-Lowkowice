import React, { useEffect, useState } from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import axios from "axios";
import ProductsGrid from "../components/products/ProductsGrid";
import Spinner from "../components/common/Spinner";
import Button from "../components/common/Button";

function CategoryPage() {
  const { slug } = useParams();
  const navigate = useNavigate();                  // ← tu
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const allowedSlugs = [
    "wedliny",
    "kielbasy",
    "wyroby-podrobowe",
    "nasze-paczki",
  ];
  const categoryTitles = {
    wedliny: "Wędliny",
    kielbasy: "Kiełbasy",
    "wyroby-podrobowe": "Wyroby podrobowe",
    "nasze-paczki": "Nasze paczki",
  };
  const slugToCategoryName = {
    wedliny: "wędliny",
    kielbasy: "kiełbasy",
    "wyroby-podrobowe": "wyroby podrobowe",
    "nasze-paczki": "paczki",
  };
  const categoryName = slugToCategoryName[slug];

  useEffect(() => {
    if (!allowedSlugs.includes(slug)) return;

    setLoading(true);
    setProducts([]);

    axios
      .get(
        `${process.env.REACT_APP_API_URL}/api/products/category/${encodeURIComponent(
          categoryName
        )}`
      )
      .then((res) => {
        setProducts(res.data);
      })
      .catch((err) => {
        if (err.response?.status === 404) {
          setProducts([]);
        } else {
          console.error("Błąd ładowania produktów:", err);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [slug]);

  if (!allowedSlugs.includes(slug)) {
    return <Navigate to="/404" replace />;
  }

  const title = categoryTitles[slug];

  return (
    <main className="page">
      <section className="intro-category-section dark-section">
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

export default CategoryPage;
