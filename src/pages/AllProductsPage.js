// src/pages/AllProductsPage.js
import React from "react";
import ProductsPageLayout from "./ProductsPageLayout";

export default function AllProductsPage() {
  return (
    <ProductsPageLayout
      title="Wszystkie produkty"
      fetchUrl={`${process.env.REACT_APP_API_URL}/api/products`}
      isAllProductsPage={true}
    />
  );
}
