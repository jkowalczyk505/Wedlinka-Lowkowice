// src/pages/CategoryPage.js
import React from "react";
import { useParams, Navigate } from "react-router-dom";
import { getCategoryMeta } from "../utils/product";
import ProductsPageLayout from "./ProductsPageLayout";

export default function CategoryPage() {
  const { slug } = useParams();
  const meta = getCategoryMeta(slug);

  if (!meta) return <Navigate to="/404" replace />;
  const { title, apiCategory } = meta;

  return (
    <ProductsPageLayout
      title={title}
      fetchUrl={`${process.env.REACT_APP_API_URL}/api/products/category/${encodeURIComponent(apiCategory)}`}
    />
  );
}
