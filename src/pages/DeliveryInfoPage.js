// src/pages/DeliveryInfoPage.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import Spinner from "../components/common/Spinner";
import LoadError from "../components/common/LoadError";

export default function DeliveryInfoPage() {
  const [methods, setMethods] = useState([]);
  const [freeThreshold, setFreeThreshold] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    axios
      .get(`${process.env.REACT_APP_API_URL}/api/shipping`)
      .then((res) => {
        setMethods(res.data.methods);
        setFreeThreshold(res.data.freeShippingThreshold);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner fullscreen={false} />;
  if (error) return <LoadError onRetry={() => window.location.reload()} />;

  return (
    <main className="page">
      <section className="delivery-info-section pattern-section">
        <div className="info-wrapper">
          {/* ---------------------------------------- */}
          <h2 className="info-title">Koszty dostawy</h2>
          <p>
            Oferujemy <strong>darmową wysyłkę</strong> dla zamówień o wartości
            co najmniej{" "}
            <strong>
              {freeThreshold.toLocaleString("pl-PL", {
                minimumFractionDigits: 0,
              })}{" "}
              zł
            </strong>
            . Koszt wysyłki jest uzależniony od wybranej formy przesyłki oraz przewoźnika. Koszty te pokrywają specjalistyczne opakowania
            termoizolacyjne oraz wkłady chłodzące, które zapewniają bezpieczny
            transport produktów.
          </p>
          <table className="shipping-table">
            <thead>
                <tr>
                <th>Sposób wysyłki</th>
                <th>Cena</th>
                </tr>
            </thead>
            <tbody>
                {methods.flatMap((m) => {
                const formattedBase =
                    m.price
                    .toLocaleString("pl-PL", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    })
                    .replace(".", ",") + " zł";

                const formattedCod =
                    m.cod
                    ? (m.price + m.codFee)
                        .toLocaleString("pl-PL", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        })
                        .replace(".", ",") + " zł"
                    : null;

                const rows = [
                    <tr key={`${m.id}-std`}>
                    <td>{m.label}</td>
                    <td>{formattedBase}</td>
                    </tr>,
                ];
                if (m.cod) {
                    rows.push(
                    <tr key={`${m.id}-cod`}>
                        <td>{m.label} (za pobraniem)</td>
                        <td>{formattedCod}</td>
                    </tr>
                    );
                }
                return rows;
                })}
            </tbody>
            </table>

          {/* ---------------------------------------- */}
          <h2 className="info-title">Czas dostawy</h2>
          <p>
            Standardowy kurier: <strong>1–2 dni robocze</strong> od momentu
            wysyłki.
          </p>
          <p>
            Paczkomaty InPost: zazwyczaj{" "}
            <strong>następny dzień roboczy</strong>.
          </p>
          <p>
            List polecony: <strong>2–4 dni robocze</strong>.
          </p>
          <p>
            Odbiór osobisty w sklepie: gotowe do odbioru w ciągu
            <strong> 2 godzin</strong> od potwierdzenia zamówienia.
          </p>

          {/* ---------------------------------------- */}
          <h2 className="info-title">Pakowanie</h2>
          <p>
            Asortyment wysyłamy wyłącznie w opakowaniach termoizolacyjnych ze
            specjalnym <strong>wkładem chłodniczym</strong>. Dokładamy
            wszelkich starań, aby nasze produkty bezpiecznie dotarły do
            odbiorcy.
          </p>
          <p>
            Produkty pakowane są w specjalistyczne{" "}
            <strong>styroboxy</strong> z dodatkowym wkładem chłodniczym.
            Styrobox jest to opakowanie styropianowe, termoizolacyjne,
            pozwalające zachować świeżość produktów, chroniąc je jednocześnie
            przed wysychaniem czy utratą zapachu. Stryoboxy zabezpieczają towar
            przed działaniem temperatury, światła, wilgoci czy uszkodzeniami
            mechanicznymi. Opakowanie powstaje z materiałów{" "}
            <strong>wysokiej jakości</strong> i posiada świadectwo jakości
            zdrowotnej PZH do transportu i magazynowania artykułów spożywczych.
          </p>
          <p>
            Dodatkowe zabezpieczenie stanowi wkład chłodzący. Jest to specjalny
            wkład żelowy, który pozwala na utrzymanie niskiej temperatury
            wewnątrz opakowania termicznego do <strong>48 godzin</strong>. Tak
            jak opakowania, tak też wkłady żelowe są bezpiecznym rozwiązaniem w
            przypadku transportu i zabezpieczenia artykułów spożywczych.
            Stosowane przez nas wkłady żelowe to produkty dopuszczone do
            kontaktu z żywnością.
          </p>
        </div>
      </section>
    </main>
  );
}
