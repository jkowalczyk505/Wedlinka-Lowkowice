// src/pages/ProductPage.js
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import Button from "../components/common/Button";
import { useCart } from "../components/cart/CartContext";
import Breadcrumbs from "../components/common/Breadcrumbs";
import QuantityStepper from "../components/common/QuantityStepper";
import RatingStars from "../components/products/RatingStars";

import {
  getCategoryMeta,
  formatSlugTitle,
  formatQuantity,
  formatGrossPrice,
} from "../utils/product";

export default function ProductPage() {
  const { categorySlug, productSlug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const { addItem } = useCart();
  const [qty, setQty] = useState(1);

  useEffect(() => {
    setLoading(true);
    axios
      .get(
        `${process.env.REACT_APP_API_URL}/api/products/slug/${productSlug}`
      )
      .then((res) => setProduct(res.data))
      .catch((err) => console.error("Błąd ładowania produktu:", err))
      .finally(() => setLoading(false));
  }, [productSlug]);

  const meta = getCategoryMeta(categorySlug);
  const categoryTitle = meta?.title || formatSlugTitle(categorySlug);
  const productTitle = product
    ? `${product.name} ${formatQuantity(product.quantity)} ${product.unit}`
    : formatSlugTitle(productSlug);

  const breadcrumbs = [
    { label: "Strona główna", to: "/" },
    { label: "Sklep", to: "/sklep" },
    { label: categoryTitle, to: `/sklep/${categorySlug}` },
    { label: productTitle },
  ];

  if (loading) {
    return (
      <main className="page">
        <section className="product-overview-section dark-section">
          <p>Ładowanie…</p>
        </section>
      </main>
    );
  }
  if (!product) {
    return (
      <main className="page">
        <section className="product-overview-section dark-section">
          <Breadcrumbs crumbs={breadcrumbs} />
          <p>Nie znaleziono produktu.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="page">
      <section className="product-overview-section dark-section">
        <Breadcrumbs crumbs={breadcrumbs} />

        <div className="product-overview">
          <div className="image-wrapper">
            <img
              src={`${process.env.REACT_APP_API_URL}/uploads/products/${product.image}`}
              alt={product.name}
            />
          </div>

          <div className="product-overview-text">
            <div
              className={`available-wrapper ${
                product.is_available ? "available" : "unavailable"
              }`}
            >
              {product.is_available ? (
                <>
                  <FaCheckCircle /> Dostępny
                </>
              ) : (
                <>
                  <FaTimesCircle /> Niedostępny
                </>
              )}
            </div>

            <h1>{product.name}</h1>
            <p className="quantity">
              Ilość: {formatQuantity(product.quantity)} {product.unit}
            </p>

            <div className="ratings-summary">
              <RatingStars rating={product.averageRating} />
              <span className="rating-label">
                {product.averageRating.toFixed(1)}
              </span>
            </div>

            <p className="price">
              {formatGrossPrice(product.price_brut)} zł
            </p>

            <form
                className="cart-form"
                onSubmit={e => {
                    e.preventDefault();
                    if (product.is_available) addItem(product, qty);
                }}
                >
                <QuantityStepper
                    value={qty}
                    min={1}
                    max={1000}
                    onChange={setQty}
                    disabled={!product.is_available}
                />

                <Button type="submit" variant="red" disabled={!product.is_available}>
                    Dodaj do koszyka
                </Button>
            </form>
          </div>
        </div>
      </section>

      <section className="product-bottom-section pattern-section">
        <div className="product-details">
          <div className="product-description">
            <h2 className>Opis</h2>
            <p>{product.description}</p>
          </div>
          <div className="product-ingredients">
            <h2>Składniki</h2>
            <p>{product.ingredients}</p>
            <h3>Alergeny</h3>
            <p>{product.allergens}</p>
          </div>
        </div>

        <div className="product-reviews">
          <h2>Opinie o produkcie</h2>
        </div>
      </section>

    </main>
  );
}
