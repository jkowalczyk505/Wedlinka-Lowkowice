import React from "react";
import { useNavigate } from "react-router-dom";

import Banner from "../components/common/Banner";
import bannerImage from "../assets/home-banner.webp";

import CategoryGrid from "../components/categories/CategoryGrid";
import { customerCategories } from "../data/categories";
import Button from "../components/common/Button";

import FeaturesSection from "../components/common/FeaturesSection";
import { homeFeatures, contactFeatures } from "../data/features";

import packingImage from "../assets/packing-info.webp";

import aboutImage from "../assets/about-section.webp";

import GallerySlider from "../components/common/GallerySlider";

import useInView from "../hooks/useInView";

function HomePage() {
  const navigate = useNavigate();

  const [packImgRef, packInView] = useInView(0.5); // prawy obraz „Jak pakujemy”
  const [aboutImgRef, aboutInView] = useInView(0.5); // lewy obraz w sekcji About

  return (
    <main className="page">
      <Banner
        backgroundImage={bannerImage}
        label="Dobre, bo swojskie"
        title="Wędliny i kiełbasy z tradycją"
        subtitle="Nasze wędliny, kiełbasy i wyroby podrobowe powstają według sprawdzonych,
        tradycyjnych receptur. Wykorzystujemy wyłącznie najlepsze składniki, bez sztucznych
        dodatków i z naturalnym dymem wędzarniczym. Smak domowej jakości prosto od
        producenta – tak, jak dawniej."
      />
      <section className="categories-section pattern-section">
        <div className="categories-info">
          <h2>Odkryj świat naszych wjątkowych propozycji</h2>
          <p>
            Zanurz się w starannie wyselekcjonowanej ofercie i wybierz
            kategorię, która spełni Twoje oczekiwania w najwyższym standardzie.
          </p>
        </div>
        <CategoryGrid items={customerCategories} />
        <div className="show-all-btn">
          <Button variant="red" onClick={() => navigate("/sklep")}>
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
                <strong>Próżniowe pakowanie:</strong> Każdy produkt trafia do
                szczelnego woreczka próżniowego, który chroni go przed dostępem
                powietrza, zachowując pełnię smaku i świeżość na dłużej.
              </li>
              <li>
                <strong>Ochrona termiczna:</strong> Stosujemy izolacyjne torby z
                warstwą aluminium, które dbają o utrzymanie odpowiednio niskiej
                temperatury w paczce.
              </li>
              <li>
                <strong>Skuteczne chłodzenie:</strong> Do przesyłki dodajemy
                mrożone wkłady żelowe - dzięki nim Twoje zamówienie dociera
                chłodne, świeże i gotowe do podania.
              </li>
              <li>
                <strong>Eko troska:</strong> Ograniczamy zbędne opakowania i
                wybieramy materiały, które możesz ponownie wykorzystać w domu –
                jak torby termoizolacyjne czy wkłady chłodzące
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
                  ? "animate--slide-in-right" // start animacji
                  : "ghost" // ukryty do czasu inView
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
              className={aboutInView ? "animate--slide-in-left" : "ghost"}
            />
          </div>
          <div className="about-content">
            <p className="subtitle">O nas</p>
            <h2>Kim jesteśmy?</h2>
            <p>
              Jesteśmy rodzinną firmą, której receptury sięgają lat 90-tych i
              korzeni w Rolniczej Spółdzielni Produkcyjnej. Nasze serce bije w
              malowniczej wsi Łowkowice na Opolszczyźnie – miejscu, które dla
              wielu naszych klientów przywołuje zapach i smak dzieciństwa. Nasza
              tradycja to połączenie pasji do rzemiosła z ponad 30-letnim
              doświadczeniem naszych rzeźników. Stawiamy na naturalne składniki,
              tradycyjne metody produkcji oraz wędzenia i wyroby bez zbędnych
              dodatków i konserwantów. Każdy etap produkcji – od starannie
              dobranych surowców po dostarczenie do Ciebie – jest dla nas ważny,
              bo wierzymy, że prawdziwy smak rodzi się z szacunku do natury.
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
