// src/pages/ProductPage.js
import { useEffect, useState, useCallback } from "react";
import { useParams, Navigate } from "react-router-dom";
import { AuthFetch } from "../components/auth/AuthFetch";
import { ReactComponent as DefaultIcon } from "../assets/szynka-ikona.svg";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import Button from "../components/common/Button";
import { useCart } from "../components/cart/CartContext";
import Breadcrumbs from "../components/common/Breadcrumbs";
import QuantityStepper from "../components/common/QuantityStepper";
import RatingStars from "../components/reviews/RatingStars";
import LoadError from "../components/common/LoadError";
import Spinner from "../components/common/Spinner";
import ReviewSummary from "../components/reviews/ReviewSummary";
import ReviewsList from "../components/reviews/ReviewsList";

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
  const [error, setError] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [freeThreshold, setFreeThreshold] = useState(null);

  const [imgError, setImgError] = useState(false);
  const imgUrl = product?.image
    ? `${process.env.REACT_APP_API_URL}/api/uploads/products/${product.image}`
    : null;

  const { addItem } = useCart();
  const [qty, setQty] = useState(1);

  const fetchProduct = useCallback(async () => {
    setLoading(true);
    setError(false);
    setNotFound(false);

    try {
      const res = await AuthFetch(
        `${process.env.REACT_APP_API_URL}/api/products/slug/${productSlug}`
      );

      if (res.status === 404) {
        setNotFound(true);
        return;
      }
      if (!res.ok) throw new Error("Network error");

      const data = await res.json(); // ← JSON mamy ręcznie
      setProduct(data);
    } catch (err) {
      console.error("Błąd ładowania produktu:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [productSlug]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

    // pobierz /api/shipping (freeShippingThreshold)
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/shipping`);
        if (!res.ok) throw new Error("shipping fetch failed");
        const data = await res.json();
        setFreeThreshold(data.freeShippingThreshold ?? null);
      } catch (e) {
        console.warn("Nie udało się pobrać progu darmowej dostawy:", e);
        setFreeThreshold(null);
      }
    })();
  }, []);

  // spinner podczas ładowania
  if (loading) {
    return (
      <main className="page">
        <section className="product-overview-section pattern-section">
          <Spinner fullscreen={false} />
        </section>
      </main>
    );
  }

  // błąd sieci / serwera
  if (error) {
    return (
      <main className="page">
        <section className="product-overview-section pattern-section">
          <LoadError
            message="Nie udało się pobrać produktu."
            onRetry={fetchProduct}
          />
        </section>
      </main>
    );
  }

  // produkt nie istnieje → 404
  if (notFound) {
    return <Navigate to="/404" replace />;
  }

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

    // funkcja pomocnicza: cena za kg (tylko gdy unit === "kg")
  const renderPricePerKg = () => {
    if (product.unit.toLowerCase() !== "kg") return null;
    if (!product.quantity || product.quantity <= 0) return null;
    const perKg = product.price_brut / product.quantity;
    return (
      <p className="price-kg">
        Cena za 1 kg: {formatGrossPrice(perKg)} zł
      </p>
    );
  };

  // funkcja pomocnicza: respektowanie \n w tekście
  const renderMultiline = (text) => {
    if (!text) return null;
    return text.split("\n").map((line, idx) => (
      <span key={idx}>
        {line}
        <br />
      </span>
    ));
  };

  return (
    <main className="page">
      <section className="product-overview-section dark-section">
        <Breadcrumbs crumbs={breadcrumbs} />

        <div className="product-overview">
          <div className="image-wrapper">
            {imgUrl && !imgError ? (
              <img
                src={imgUrl}
                alt={product.name}
                onError={() => setImgError(true)}
              />
            ) : (
              <DefaultIcon className="default-icon" />
            )}
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

            <p className="price">{formatGrossPrice(product.price_brut)} zł</p>
            {renderPricePerKg()}

            <div className="delivery-info-panel">
              <ul>
                 {freeThreshold !== null && (
                   <li>
                     Darmowa dostawa od{" "}
                     <strong>
                       {freeThreshold.toLocaleString("pl-PL", {
                         minimumFractionDigits: 0,
                       })}{" "}
                       zł
                     </strong>
                   </li>
                 )}
                 <li>
                   Paczki wysyłamy w poniedziałki i wtorki w tygodniu
                   następującym po złożeniu zamówienia
                 </li>
                 <li>Czas wysyłki 4–8 dni</li>
               </ul>
             </div>

            <form
              className="cart-form"
              onSubmit={(e) => {
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

              <Button
                type="submit"
                variant="red"
                disabled={!product.is_available}
              >
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
            <p>{renderMultiline(product.description)}</p>
          </div>
          <div className="product-ingredients">
            <h2>Składniki</h2>
            <p>{renderMultiline(product.ingredients)}</p>
            <h3>Alergeny</h3>
            <p>{renderMultiline(product.allergens)}</p>
          </div>
        </div>

        <div className="product-reviews">
          <h2>Opinie o produkcie</h2>
          <ReviewSummary
            avg={product.averageRating}
            total={product.reviewsCount}
            canReview={product.canReview}
            productId={product.id}
            onReviewAdded={fetchProduct}
          />

          <ReviewsList productId={product.id} />
        </div>
      </section>
    </main>
  );
}
