import React from "react";
import Slider from "react-slick";

const importAll = (r) => r.keys().map(r);
const images = importAll(
  require.context("../../assets/gallery", false, /\.(png|jpe?g|webp)$/)
);

export default function GallerySlider() {
  const settings = {
    dots: true,
    infinite: true,
    speed: 600,
    slidesToShow: 3,
    slidesToScroll: 1,
    arrows: true,
    autoplay: true,
    autoplaySpeed: 4500,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
      { breakpoint: 640, settings: { slidesToShow: 1 } },
    ],
  };

  return (
    <div className="gallery-slider">
      <Slider {...settings}>
        {images.map((src, idx) => (
          <div key={idx} className="gallery-slide">
            <img src={src} alt={`Slide ${idx + 1}`} />
          </div>
        ))}
      </Slider>
    </div>
  );
}