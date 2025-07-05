import React from "react";
import { NavLink } from "react-router-dom";

export default function CategoryTile({ title, image, icon, to }) {
  return (
    <NavLink to={to} className="category-tile">
      <div
        className="tile-image"
        style={{ backgroundImage: `url(${image})` }}
      />
      <div className="tile-overlay">
        {icon && <div className="tile-icon">{icon}</div>}
        <h3 className="tile-title">{title}</h3>
      </div>
    </NavLink>
  );
}
