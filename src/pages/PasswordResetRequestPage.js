import { useState } from "react";
import { useAlert } from "../components/common/alert/AlertContext";
import FormContainer from "../components/forms/FormContainer";
import Button from "../components/common/Button";
import Spinner from "../components/common/Spinner";

export default function PasswordResetRequestPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { showAlert } = useAlert();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/auth/password-reset/request`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      if (res.ok) {
        showAlert("Wysłano e-mail z linkiem do resetu hasła", "success");
      } else {
        const data = await res.json();
        showAlert(data.error || "Wystąpił błąd", "error");
      }
    } catch {
      showAlert("Błąd sieci", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <section className="pattern-section password-reset-section">
        <div className="back-link">
          <a href="/logowanie">← Powrót do logowania</a>
        </div>

        <FormContainer title="Reset hasła" onSubmit={handleSubmit}>
          <label>Adres e-mail</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div className="submit-button">
            <Button type="submit" disabled={loading}>
              {loading ? <Spinner size="small" /> : "Wyślij link do resetu"}
            </Button>
          </div>
        </FormContainer>
      </section>
    </div>
  );
}
