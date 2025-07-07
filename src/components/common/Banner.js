import React, { useState, useEffect } from "react";
import Spinner from "./Spinner";
import useInView from "../../hooks/useInView";

function Banner({ title, subtitle, label, backgroundImage }) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = backgroundImage;
    img.onload = () => setLoaded(true);
  }, [backgroundImage]);

  const [ref, inView] = useInView();

  return (
    <section
      className="banner"
      style={{
        backgroundImage: loaded ? `url(${backgroundImage})` : "none",
      }}
    >
      {!loaded && (
        <div className="banner__spinner">
          <Spinner size="large" />
        </div>
      )}

      <div className="banner__overlay">
        <div ref={ref} className={`banner__content ${inView ? "animate--fade-in-up" : ""}`}>
          {label && <p className="banner__label">{label}</p>}
          {title && <h1 className="banner__title">{title}</h1>}
          {subtitle && <p className="banner__subtitle">{subtitle}</p>}
        </div>
      </div>
    </section>
  );
}

export default Banner;
