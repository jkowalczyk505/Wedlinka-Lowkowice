import React from "react";

function Banner({ title, subtitle, label, backgroundImage }) {
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
      </div>
    </section>
  );
}

export default Banner;
