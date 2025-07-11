import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ReactComponent as DefaultIcon } from "../../assets/szynka-ikona.svg";
import { FaStar, FaRegStar, FaStarHalfAlt } from "react-icons/fa";
import AddToCartButton from "../common/AddToCart";
import { formatGrossPrice, formatQuantity } from "../../utils/product";

function ProductTile({ product }) {
  const {
    name,
    price_net,
    vat_rate,
    image,
    quantity,
    unit,
    is_available,
    averageRating = 2.5,
    slug
  } = product;

  const grossPrice = formatGrossPrice(price_net, vat_rate);

  const imgUrl = `${process.env.REACT_APP_API_URL}/uploads/products/${image}`;

  const [imgError, setImgError] = useState(false);

  const fullStars = Math.floor(averageRating);
  const hasHalf = averageRating - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  return (
    <div className={`product-tile ${!is_available ? 'unavailable' : ''}`}>
      <div className={`image-wrapper ${!is_available ? 'unavailable' : ''}`}>
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
      </div>
      <div className="product-content">
        <h3 className="product-name">
          <Link to={slug} className="product-link">{name}</Link>
        </h3>
        <p className="product-quantity">
          Ilość: {formatQuantity(quantity)} {unit}
        </p>

        <div className="product-rating">
          {/* pełne gwiazdki */}
          {Array.from({ length: fullStars }).map((_, i) => (
            <FaStar key={"full" + i} className="star filled" />
          ))}
          {/* połowa */}
          {hasHalf && <FaStarHalfAlt className="star half" />}
          {/* puste */}
          {Array.from({ length: emptyStars }).map((_, i) => (
            <FaRegStar key={"empty" + i} className="star" />
          ))}
        </div>

        <p className="product-price">{grossPrice} zł</p>

        <div className="product-action">
         <AddToCartButton
           onClick={() => alert(`Produkt dodany do koszyka`)}
           disabled={!is_available}
         />
        </div>
      </div>
    </div>
  );
}

export default ProductTile;
