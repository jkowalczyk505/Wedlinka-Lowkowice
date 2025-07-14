import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ReactComponent as DefaultIcon } from "../../assets/szynka-ikona.svg";
import AddToCartButton from "../common/AddToCart";
import { formatGrossPrice, formatQuantity, categoryToSlug } from "../../utils/product";
import { useCart } from "../cart/CartContext";
import RatingStars from "../reviews/RatingStars";

function ProductTile({ product }) {
  const {
    name,
    price_brut,
    image,
    quantity,
    unit,
    is_available,
    averageRating,
    slug,
    category,
  } = product;

  const categorySlug = categoryToSlug(category);

  const { addItem } = useCart();

  const grossPrice = formatGrossPrice(price_brut);

  const imgUrl = `${process.env.REACT_APP_API_URL}/uploads/products/${image}`;

  const [imgError, setImgError] = useState(false);

  return (
    <div className={`product-tile ${!is_available ? "unavailable" : ""}`}>
      <div className={`image-wrapper ${!is_available ? "unavailable" : ""}`}>
        {/* całość obrazka w linku */}
        <Link to={`/sklep/${categorySlug}/${slug}`} className="image-link">
          {!imgError && image ? (
            <img
              src={imgUrl}
              alt={name}
              className="product-image"
              onError={() => setImgError(true)}
            />
          ) : (
            <DefaultIcon className="product-image default-icon" />
          )}
          {!is_available && (
            <span className="unavailable-badge">Niedostępny</span>
          )}
        </Link>
      </div>
      <div className="product-content">
        <h3 className="product-name">
          <Link to={`/sklep/${categorySlug}/${slug}`} className="product-link">{name}</Link>
        </h3>
        <p className="product-quantity">
          Ilość: {formatQuantity(quantity)} {unit}
        </p>

        <div className="product-rating">
          <RatingStars rating={averageRating} />
        </div>

        <p className="product-price">{grossPrice} zł</p>

        <div className="product-action">
          <AddToCartButton
            onClick={() => addItem(product, 1)}
            disabled={!is_available}
          />
        </div>
      </div>
    </div>
  );
}

export default ProductTile;
