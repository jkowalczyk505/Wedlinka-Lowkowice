import React from "react";

function ProductTile({ product }) {
  const {
    name,
    price_net,
    vat_rate,
    image,
    quantity,
    unit,
    averageRating = 0,
  } = product;

  // VAT jako ułamek: 0.05 → 5%
  const grossPrice = (parseFloat(price_net) * (1 + parseFloat(vat_rate))).toFixed(2);

  return (
    <div className="product-tile">
      <div className="image-wrapper">
        <img
          src={`${process.env.REACT_APP_API_URL}/uploads/products/${image}`}
          alt={name}
          className="product-image"
        />
      </div>
      <div className="product-content">
        <h3 className="product-name">{name}</h3>
        <p className="product-price">{grossPrice} zł</p>
        <p className="product-quantity">
          {parseFloat(quantity).toFixed(2)} {unit}
        </p>
        <div className="product-rating">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={star <= averageRating ? "star filled" : "star"}
            >
              ★
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProductTile;
