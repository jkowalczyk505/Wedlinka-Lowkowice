// src/components/categories/CategoryGrid.js
import React from "react";
import AnimatedCategoryTile from "./AnimatedCategoryTile";

export default function CategoryGrid({ items, className = "" }) {
  return (
    <div className={`category-grid ${className}`}>
      {items.map((item, idx) => (
        <AnimatedCategoryTile key={item.id} item={item} index={idx} />
      ))}
    </div>
  );
}
