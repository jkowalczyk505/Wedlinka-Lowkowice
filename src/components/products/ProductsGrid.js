import React from "react";
import ProductTile from "./ProductTile";

function ProductsGrid({ products }) {
  return (
    <div className="products-grid">
      {products.map((product) => (
        <ProductTile key={product._id} product={product} />
      ))}
    </div>
  );
}

export default ProductsGrid;
