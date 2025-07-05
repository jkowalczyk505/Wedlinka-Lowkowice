import React from "react";
import Banner from "../components/common/Banner";
import bannerImage from "../assets/home-banner.jpg";

import CategoryGrid from "../components/common/categories/CategoryGrid";
import { customerCategories } from "../data/categories";

import FeaturesSection from "../components/common/FeaturesSection";
import { homeFeatures, contactFeatures } from "../data/features";

function HomePage() {
    return (
        <main className="page">
            <Banner
                backgroundImage={bannerImage}
                label="Dobre, bo swojskie"
                title="Wędliny i kiełbasy z tradycją"
                subtitle="Wędliny, kiełbasy i wyroby podrobowe przygotowywane według tradycyjnych receptur, z najlepszych składników i bez zbędnych dodatków. Kupuj bezpośrednio od producenta."
            />
            <section className="categories-section creamy-section">
                <div className="categories-info">
                    <h2>Co znajdziesz w naszej ofercie?</h2>
                    <p>Sprawdź, co oferujemy - wybierz interesującą Cię grupę.</p>
                </div>
                <CategoryGrid items={customerCategories} linkMode={true} />
            </section>
            <FeaturesSection items={homeFeatures} className="white-section" />
            <section className="packing-section red-section">
                <h2>Jak pakujemy?</h2>
                <p>Quis tempor consequat labore do ea laboris aliqua non eiusmod. Mollit nostrud cupidatat reprehenderit occaecat nisi qui aliquip consectetur Lorem incididunt ullamco est excepteur dolore. Ut enim excepteur id cupidatat. Id et duis voluptate sit ut duis duis esse cupidatat voluptate cillum nisi. Amet minim sit commodo magna irure officia ea occaecat. Nostrud ipsum cupidatat nostrud qui deserunt aute minim non occaecat veniam aliqua ut veniam quis. Consectetur eu irure non esse nisi sunt amet aute est.</p>
            </section>
            <section className="about-section white-section"></section>
            <FeaturesSection items={contactFeatures} className="red-section" />
        </main>
    );
}

export default HomePage;