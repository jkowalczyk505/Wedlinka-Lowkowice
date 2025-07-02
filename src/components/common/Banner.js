import React from "react";
import { NavLink } from "react-router-dom";

function Banner({ title, subtitle, label, buttonText, buttonLink, backgroundImage }) {
  return (
    <section
      className="banner"
      style={{
        backgroundImage: `url(${backgroundImage})`,
      }}
    >
      <div className="banner__overlay">
        {label && <p className="banner__label">{label}</p>}
        {title && <h1 className="banner__title">{title}</h1>}
        {subtitle && <p className="banner__subtitle">{subtitle}</p>}
        {buttonText && buttonLink && (
          <NavLink to={buttonLink} className="banner__button">
            {buttonText}
          </NavLink>
        )}
      </div>
    </section>
  );
}

export default Banner;
