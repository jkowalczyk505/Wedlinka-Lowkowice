import React from "react";
import { useNavigate } from "react-router-dom";

import Banner from "../components/common/Banner";
import bannerImage from "../assets/home-banner.jpg";

import CategoryGrid from "../components/categories/CategoryGrid";
import { customerCategories } from "../data/categories";
import Button from "../components/common/Button";

import FeaturesSection from "../components/common/FeaturesSection";
import { homeFeatures, contactFeatures } from "../data/features";

import packingImage from "../assets/packing-info.png";

import aboutImage from "../assets/about-section.jpg";

import GallerySlider from "../components/common/GallerySlider";

import useInView from "../hooks/useInView";

function HomePage() {
  const navigate = useNavigate();

  const [packImgRef,  packInView]  = useInView(0.5);   // prawy obraz „Jak pakujemy”
  const [aboutImgRef, aboutInView] = useInView(0.5);   // lewy obraz w sekcji About

  return (
    <main className="page">
      <Banner
        backgroundImage={bannerImage}
        label="Dobre, bo swojskie"
        title="Wędliny i kiełbasy z tradycją"
        subtitle="Wędliny, kiełbasy i wyroby podrobowe przygotowywane według tradycyjnych receptur, z najlepszych składników i bez zbędnych dodatków. Kupuj bezpośrednio od producenta."
      />
      <section className="categories-section pattern-section">
        <div className="categories-info">
          <h2>Co znajdziesz w naszej ofercie?</h2>
          <p>Sprawdź, co oferujemy - wybierz interesującą Cię grupę.</p>
        </div>
        <CategoryGrid items={customerCategories} />
        <div className="show-all-btn">
          <Button variant='red' onClick={() => navigate("/sklep")}>
            Pokaż wszystkie
          </Button>
        </div>
      </section>
      <FeaturesSection items={homeFeatures} className="red-section" />
      <section className="packing-section dark-section">
        <div className="packing-info-tile">
          <div className="packing-info">
            <h2>Bezpieczne i świeże dostawy</h2>
            <ul>
              <li>
                <strong>Próżniowe pakowanie:</strong> Produkty są pakowane w
                szczelne woreczki próżniowe, które chronią je przed dostępem
                powietrza i wydłużają ich świeżość.
              </li>
              <li>
                <strong>Ochrona termiczna:</strong> Używamy izolacyjnych toreb z
                warstwą aluminium, które utrzymują niską temperaturę wewnątrz
                paczki.
              </li>
              <li>
                <strong>Wkłady chłodzące:</strong> Do każdego zamówienia
                dodajemy zamrożoną wodę w butelkach – dzięki niej wyroby dotrą
                do Ciebie chłodne, świeże i gotowe do spożycia.
              </li>
              <li>
                <strong>Ekologiczne podejście:</strong> Staramy się ograniczać
                zbędne opakowania i korzystamy z materiałów, które można łatwo
                poddać recyklingowi lub ponownie wykorzystać w domu – jak torby
                termoizolacyjne czy butelki chłodzące.
              </li>
            </ul>
          </div>
          <div className="packing-info-image">
            <img
              ref={packImgRef}
              src={packingImage}
              alt="Pakowanie produktów"
              className={
                packInView
                  ? "animate--slide-in-right"   // start animacji
                  : "ghost"                     // ukryty do czasu inView
              }
            />
          </div>
        </div>
      </section>
      <section className="about-section white-section">
        <div className="about-tile">
          <div className="about-image">
            <img
              ref={aboutImgRef}
              src={aboutImage}
              alt="Nasz zespół"
              className={
                aboutInView
                  ? "animate--slide-in-left"
                  : "ghost"
              }
            />
          </div>
          <div className="about-content">
            <p className="subtitle">O nas</p>
            <h2>Kim jesteśmy?</h2>
            <p>
              Jesteśmy rodzinną firmą z tradycjami sięgającymi trzech pokoleń.
              Każdego dnia łączymy pasję z rzemiosłem, by tworzyć najwyższej
              jakości wędliny i kiełbasy. Nasz zespół to wykwalifikowani
              rzeźnicy i specjaliści ds. logistyki, którzy dbają o każdy etap –
              od wyboru mięsa, przez produkcję, aż po bezpieczną dostawę prosto
              do Twoich drzwi.
            </p>
            <p>
              Ufamy w siłę lokalnych składników i współpracujemy tylko z
              sprawdzonymi hodowcami, bo wierzymy, że prawdziwy smak rodzi się
              blisko natury.
            </p>
          </div>
        </div>
      </section>
      <FeaturesSection items={contactFeatures} className="red-section" />
      <section className="gallery-section pattern-section">
        <GallerySlider />
      </section>
    </main>
  );
}

export default HomePage;
