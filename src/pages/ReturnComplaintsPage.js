import React from "react";

function ReturnComplaintsPage() {
  return (
    <main className="page">
      <section className="return-complaints-section pattern-section">
        <div className="policy-wrapper">
          <h1>Polityka zwrotów i reklamacji</h1>

          <p>
            Z uwagi na charakter naszych produktów, które są artykułami
            spożywczymi, nie mamy możliwości przyjęcia zwrotów. Ze względu na
            ich łatwo psujący się charakter oraz wymogi higieniczne, prosimy o
            staranne przemyślenie zakupu przed złożeniem zamówienia.
          </p>

          <h2>Reklamacje</h2>
          <p>
            Chcemy, aby każdy zakup u nas był w pełni satysfakcjonujący. Jeśli
            otrzymany produkt jest uszkodzony, nieświeży lub niezgodny z
            zamówieniem, prosimy o kontakt – najlepiej tego samego dnia.
            Wystarczy przesłać zdjęcie oraz numer zamówienia na adres:&nbsp;
            <a href="mailto:kontakt@wedlinkalowkowice.pl">
              kontakt@wedlinkalowkowice.pl
            </a>
            . Każdą reklamację rozpatrujemy indywidualnie, a jeśli zgłoszenie
            będzie uznane za zasadne, zaproponujemy rozwiązanie, które będzie
            dla Ciebie najbardziej odpowiednie – np. ponowną wysyłkę, częściowy
            zwrot kosztów lub inną formę rekompensaty.
          </p>

          <h2>Zwroty</h2>
          <p>
            Ze względu na specyfikę naszych produktów, zwroty artykułów
            spożywczych, szczególnie tych wymagających warunków chłodniczych lub
            o krótkim terminie przydatności, nie są możliwe. Dziękujemy za
            zrozumienie i cieszymy się, że możemy Cię gościć w naszym sklepie.
          </p>

          <p>Zapraszamy ponownie!</p>
        </div>
      </section>
    </main>
  );
}

export default ReturnComplaintsPage;
