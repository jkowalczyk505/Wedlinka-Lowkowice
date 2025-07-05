import React from "react";

export default function FeaturesSection({
  items,
  className = "",         // white-section lub inna
  children,               // reszta w sekcji miedzy znacznikami komponentu
}) {
  return (
    <section className={`features-section ${className}`}>
      {items.map(({ id, icon, title, subtitle }) => (
        <div key={id} className="feature-item">
          <div className="feature-icon">{icon}</div>
          <h4 className="feature-title">{title}</h4>
          <p className="feature-subtitle">{subtitle}</p>
        </div>
      ))}
      {children}
    </section>
  );
}
