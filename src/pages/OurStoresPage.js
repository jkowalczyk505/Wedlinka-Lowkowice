import lowkowiceImg from "../assets/stores/zdjęcie sklepu.webp";

export default function OurStoresPage() {
  return (
    <main className="page our-stores-page">
      <section className="our-stores-section pattern-section">
        <h1>Miejsca, gdzie nas znajdziesz</h1>

        <div className="stores-list">
          {/* Sklep 1 z obrazkiem */}
          <div className="store-item">
            <div className="store-image">
              <img src={lowkowiceImg} alt="Sklep Firmowy na Targowisku w Kluczborku" />
            </div>
            <div className="store-info">
              <h2>Sklep Firmowy na Targowisku w Kluczborku</h2>
              <p className="description">
                Zapraszamy do naszego sklepu na Kluczborskim targowisku, gdzie znajdziesz szeroki wybór
                świeżych wędlin, mięsa oraz gotowych produktów, które powstały w naszym zakładzie.
                To doskonałe miejsce, by zakupić nasze najlepsze wyroby wędliniarskie bezpośrednio od producenta.
              </p>
              <p className="address">
                Targowisko Miejskie, ul. Moniuszki 1, 46-200 Kluczbork
              </p>
              <p className="hours">
                <strong>Godziny otwarcia:</strong><br />
                Pon i Śr – 8.00–15.00<br />
                Wt, Czw, Pt – 8.00–16.00<br />
                Sob – 8.00–13.00
              </p>
            </div>
          </div>

          {/* Sklep 2 bez obrazka */}
          <div className="store-item text-only">
            <div className="store-info">
              <h2>Sklep Firmowy przy Masarni w Łowkowicach</h2>
              <p className="description">
                Kup wędliny prosto z serca produkcji! Nasz sklep firmowy przy masarni to miejsce, w którym
                znajdziesz najwyższej jakości świeże produkty mięsne oraz wędliny, przygotowywane na miejscu
                z dbałością o każdy detal. To idealna okazja, by zakupić nasze wyroby wędliniarskie bezpośrednio tam, gdzie powstają.
              </p>
              <p className="address">
                ul. Księdza Rigola 42, 46-211 Łowkowice
              </p>
              <p className="hours">
                <strong>Godziny otwarcia:</strong><br />
                Wtorek i Czwartek – 8.00–10.00
              </p>
            </div>
          </div>
        </div>

        {/* Akapit o współpracy */}
        <div className="cooperation-info">
          <h2>Dostarczamy Nasze Produkty do Lokalnych Sklepów</h2>
          <p>
            Z dumą oferujemy nasz pełen asortyment wędlin, mięsa oraz gotowych produktów również do lokalnych sklepów.
            Współpracujemy z punktami sprzedaży w regionie, zapewniając im regularne dostawy świeżych i wysokiej jakości
            produktów mięsnych. Dzięki naszej elastyczności i punktualności, sklepy mogą mieć pewność, że zawsze otrzymają towar
            najwyższej jakości, zgodnie z ustalonymi terminami.
          </p>
          <strong>
            Jeśli chcesz nawiązać współpracę i wprowadzić nasze wyroby do swojej oferty, skontaktuj się z nami!
          </strong>
        </div>
      </section>
    </main>
  );
}
