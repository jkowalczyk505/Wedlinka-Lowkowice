// src/components/categories/AnimatedCategoryTile.js
import React from "react";
import useInView from "../../hooks/useInView";
import CategoryTile from "./CategoryTile";

export default function AnimatedCategoryTile({ item, index }) {
  const [ref, inView] = useInView(0.2);

  return (
    <div
      ref={ref}
      className={`
        category-tile-wrapper
        ${inView ? `animate--fade-in-up animate--delay-${index + 1}` : ""}`}
    >
      <CategoryTile {...item} />
    </div>
  );
}
