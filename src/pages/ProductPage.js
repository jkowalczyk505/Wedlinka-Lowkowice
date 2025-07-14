import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

import Button from "../components/common/Button";
import Breadcrumbs from "../components/common/Breadcrumbs";
import { getCategoryMeta, formatSlugTitle } from "../utils/product";

function ProductPage() {
  const { categorySlug, productSlug } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${process.env.REACT_APP_API_URL}/api/products/slug/${productSlug}`)
      .then((res) => setProduct(res.data))
      .catch((err) => {
        console.error("Błąd ładowania produktu:", err);
      })
      .finally(() => setLoading(false));
  }, [productSlug]);

  const meta = getCategoryMeta(categorySlug);
  const categoryTitle = meta?.title || formatSlugTitle(categorySlug);
  const productTitle = product?.name || formatSlugTitle(productSlug);

  const breadcrumbs = [
    { label: "Strona główna", to: "/" },
    { label: "Sklep", to: "/sklep" },
    { label: categoryTitle, to: `/sklep/${categorySlug}` },
    { label: productTitle },
  ];

  if (loading) {
    return (
      <main className="page">
        <section className="product-overview-section pattern-section">
          <p>Ładowanie...</p>
        </section>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="page">
        <section className="product-overview-section pattern-section">
          <p>Nie znaleziono produktu.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="page">
      <section className="product-overview-section pattern-section">
        <Breadcrumbs crumbs={breadcrumbs} />

        <div className="product-overview">
          <div className="image-wrapper">
            <img
              src={`${process.env.REACT_APP_API_URL}/uploads/products/${product.image}`}
              alt={product.name}
            />
          </div>

          <div className="product-overview-text">
            <div className="ratings-summary"></div>
            <p>{product.is_available ? "Dostępny" : "Niedostępny"}</p>
            <h1>{product.name}</h1>
            <p>Ilość: {product.quantity} {product.unit}</p>
            <p>Cena: {product.price_brut} zł</p>
            <form className="cart-form">
              <div className="quantity"></div>
              <Button>Dodaj do koszyka</Button>
            </form>
          </div>
        </div>
      </section>

      <section className="product-description-section">
        <h2>Opis</h2>
        <p>{product.description}</p>
      </section>

      <section className="product-composition-section">
        <h2>Składniki</h2>
        <p>{product.ingredients}</p>
        <h3>Alergeny</h3>
        <p>{product.allergens}</p>
      </section>

      <section className="product-reviews-section">
        <h2>Opinie</h2>
        {/* TODO: komponent z opiniami */}
      </section>
    </main>
  );
}

export default ProductPage;
