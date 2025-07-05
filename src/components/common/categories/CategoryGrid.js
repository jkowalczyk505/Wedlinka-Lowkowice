import React from "react";
import CategoryTile from "./CategoryTile";

export default function CategoryGrid({ items, className = "" }) {
  return (
    <div className={`category-grid ${className}`}>
      {items.map(item => (
        <CategoryTile
          key={item.id}
          title={item.title}
          image={item.image}
          icon={item.icon}
          to={item.to}
        />
      ))}
    </div>
  );
}
