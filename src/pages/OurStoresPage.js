import lowkowiceImg from "../assets/stores/lowkowice.jpg";
import kkImg from "../assets/stores/kk.jpg";

const stores = [
  {
    id: 1,
    name: "Sklep firmowy w Łowkowicach",
    description:
      "Główny sklep firmowy znajdujący się przy zakładzie produkcyjnym. Znajdziesz tu pełen asortyment naszych wyrobów wędliniarskich, świeże mięso oraz pakowane produkty gotowe do spożycia.",
    address: "ul. Główna 12, 47-300 Łowkowice",
    image: lowkowiceImg,
  },
  {
    id: 2,
    name: "Sklep partnerski w Kędzierzynie-Koźlu",
    description:
      "Sklep partnerski zlokalizowany w centrum miasta, oferujący codziennie świeże dostawy z naszego zakładu. Idealne miejsce na szybkie zakupy przed obiadem.",
    address: "ul. Piastowska 8, 47-200 Kędzierzyn-Koźle",
    image: kkImg,
  },
  // kolejne obiekty, gdy pojawią się nowe sklepy
];

export default function OurStoresPage() {
  return (
    <main className="page our-stores-page">
      <section className="our-stores-section pattern-section">
        <h1>Nasze sklepy stacjonarne</h1>

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
