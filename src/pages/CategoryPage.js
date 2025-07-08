import React from "react";
import { useParams, Navigate } from "react-router-dom";

function CategoryPage() {
    const { slug } = useParams();

    const allowedSlugs = ["wedliny", "kielbasy", "wyroby-podrobowe", "nasze-paczki"];

    if (!allowedSlugs.includes(slug)) {
        return <Navigate to="/404" replace />;
    }

    const categoryTitles = {
        "wedliny": "Wędliny",
        "kielbasy": "Kiełbasy",
        "wyroby-podrobowe": "Wyroby podrobowe",
        "nasze-paczki": "Nasze paczki"
    };

    const title = categoryTitles[slug];

    return (
        <main className="page">
            <section className="intro-category-section dark-section">
                {/* <Breadcrumbs /> */}
                <h1>{title}</h1>
                {/* <SortControl /> */}
            </section>

            <section className="products-grid-section pattern-section">
                <p>Wyświetlam produkty z kategorii: <strong>{title}</strong></p>
            </section>
        </main>
    );
}

export default CategoryPage;
