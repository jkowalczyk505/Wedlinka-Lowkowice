import React from "react";
import { NavLink } from "react-router-dom";

function CategoryTile({ title, image, to }) {
  return (
    <NavLink to={to} className="category-tile">
      <div className="tile-image" style={{ backgroundImage: `url(${image})` }} />
      <div className="tile-overlay">
        <h3 className="tile-title">{title}</h3>
      </div>
    </NavLink>
  );
}

export default CategoryTile;
