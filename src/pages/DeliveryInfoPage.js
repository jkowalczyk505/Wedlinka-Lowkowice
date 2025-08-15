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
            Z radością oferujemy naszym Klientom{" "}
            <strong>darmową wysyłkę</strong> przy zamówieniach o wartości co
            najmniej{" "}
            <strong>
              {freeThreshold.toLocaleString("pl-PL", {
                minimumFractionDigits: 0,
              })}{" "}
              zł
            </strong>
            . Koszt transportu zależy od wybranej metody dostawy oraz
            przewoźnika. Cena obejmuje także specjalistyczne opakowania
            termoizolacyjne oraz wkłady chłodzące, które gwarantują bezpieczny i
            odpowiedni transport naszych produktów.
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

                const formattedCod = m.cod
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
            Kurier standardowy: <strong>1–2 dni robocze</strong> od momentu
            wysyłki.
          </p>
          <p>
            Paczkomaty InPost: <strong>1–2 dni robocze</strong> od momentu
            wysyłki.
          </p>
          <p>
            Odbiór osobisty: dostępność do odbioru w ciągu{" "}
            <strong>2 godzin</strong> od zmiany statusu zamówienia na gotowe do
            odbioru.
          </p>

          {/* ---------------------------------------- */}
          <h2 className="info-title">Pakowanie</h2>
          <p>
            Dbamy o najwyższą jakość usług, dlatego wszystkie nasze produkty
            wysyłamy w specjalistycznych opakowaniach termoizolacyjnych, które
            zapewniają odpowiednią ochronę oraz świeżość towarów. Nasze artykuły
            pakujemy w kartony wyposażone w torby termoizolacyjne – innowacyjne
            rozwiązanie, które skutecznie chroni produkty przed zmianami
            temperatury, wilgocią, światłem oraz uszkodzeniami mechanicznymi.
          </p>
          <p>
            Aby zapewnić optymalną temperaturę, stosujemy również wkłady
            chłodzące. Są to specjalistyczne wkłady żelowe, które utrzymują
            niską temperaturę wewnątrz opakowania. Wkłady te są w pełni
            bezpieczne do kontaktu z żywnością, co czyni je idealnym
            rozwiązaniem do transportu produktów spożywczych.
          </p>
        </div>
      </section>
    </main>
  );
}
