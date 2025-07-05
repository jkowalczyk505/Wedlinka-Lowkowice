import React from "react";
import Banner from "../components/common/Banner";
import bannerImage from "../assets/home-banner.jpg";

import CategoryGrid from "../components/common/categories/CategoryGrid";
import { customerCategories } from "../data/categories";

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
                <CategoryGrid items={customerCategories} linkMode={true} />
            </section>
            <section className="white-section">
                <h1>Tralalla</h1>
                <p>Nostrud ad do Lorem sint anim dolor do sint pariatur. Aute mollit et commodo incididunt duis cillum. Enim sint sint esse et Lorem consequat id consequat in non nisi. Irure et amet aliquip aliqua sint enim id. Lorem tempor cupidatat esse enim tempor occaecat. Excepteur et cupidatat ipsum pariatur aute exercitation. Mollit ad dolor ullamco occaecat occaecat eu qui laboris nulla.</p>
            </section>
        </main>
    );
}

export default HomePage;