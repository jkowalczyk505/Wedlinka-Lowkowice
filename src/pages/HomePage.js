import Banner from "../components/common/Banner";
import bannerImage from "../assets/home-banner.jpg";

function HomePage() {
    return (
        <main className="page">
            <Banner
                backgroundImage={bannerImage}
                label="Dobre, bo swojskie"
                title="Wędliny i kiełbasy z tradycją"
                subtitle="Wędliny, kiełbasy i wyroby podrobowe przygotowywane według tradycyjnych receptur, z najlepszych składników i bez zbędnych dodatków. Kupuj bezpośrednio od producenta."
            />
            <section className=""></section>
        </main>
    );
}

export default HomePage;