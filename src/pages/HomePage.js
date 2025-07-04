import Banner from "../components/common/Banner";
import bannerImage from "../assets/home-banner.jpg";

import CategoryTile from "../components/common/CategoryTile";
import kielbasyImg from "../assets/kielbasy.jpg";
import wedlinyImg from "../assets/wedliny.jpg";
import podroboweImg from "../assets/podrobowe.jpg";
import paczkiImg from "../assets/paczki.jpg";

function HomePage() {
    return (
        <main className="page">
            <Banner
                backgroundImage={bannerImage}
                label="Dobre, bo swojskie"
                title="Wędliny i kiełbasy z tradycją"
                subtitle="Wędliny, kiełbasy i wyroby podrobowe przygotowywane według tradycyjnych receptur, z najlepszych składników i bez zbędnych dodatków. Kupuj bezpośrednio od producenta."
            />
            <section className="products-section creamy-section">
                <div className="products-info">
                    <h2>Co znajdziesz w naszej ofercie?</h2>
                    <p>Sprawdź, co oferujemy - wybierz interesującą Cię grupę.</p>
                </div>
                <div className="category-grid">
                    <CategoryTile title="Kiełbasy" image={kielbasyImg} to="/kielbasy" />
                    <CategoryTile title="Wędliny" image={wedlinyImg} to="/wedliny" />
                    <CategoryTile title="Wyroby podrobowe" image={podroboweImg} to="/wyroby-podrobowe" />
                    <CategoryTile title="Paczki" image={paczkiImg} to="/nasze-paczki" />
                </div>
            </section>
        </main>
    );
}

export default HomePage;