import lowkowiceImg from "../assets/stores/zdjęcie sklepu.webp";

const stores = [
  {
    id: 1,
    name: "Sklep Firmowy na Targowisku w Kluczborku",
    description:
      "Zapraszamy do naszego sklepu na Kluczborskim targowisku, gdzie znajdziesz szeroki wybór świeżych wędlin, mięsa oraz gotowych produktów, które powstały w naszym zakładzie. To doskonałe miejsce, by zakupić nasze najlepsze wyroby wędliniarskie bezpośrednio od producenta.",
    address: "Targowisko Miejskie ul. Moniuszki 1, 46-200 Kluczbork",
    image: lowkowiceImg,
  },
];

export default function OurStoresPage() {
  return (
    <main className="page our-stores-page">
      <section className="our-stores-section pattern-section">
        <h1>Miejsca, gdzie nas znajdziesz</h1>

        <div className="stores-list">
          {stores.map((store, index) => (
            <div
              key={store.id}
              className={`store-item ${index % 2 === 1 ? "reverse" : ""}`}
            >
              <div className="store-image">
                <img src={store.image} alt={store.name} />
              </div>
              <div className="store-info">
                <h2>{store.name}</h2>
                <p className="description">{store.description}</p>
                <p className="address">{store.address}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
