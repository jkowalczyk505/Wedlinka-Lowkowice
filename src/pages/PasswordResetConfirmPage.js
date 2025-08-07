import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAlert } from "../components/common/alert/AlertContext";
import FormContainer from "../components/forms/FormContainer";
import Button from "../components/common/Button";
import Spinner from "../components/common/Spinner";

export default function PasswordResetConfirmPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { showAlert } = useAlert();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

    if (!passwordRegex.test(password)) {
      showAlert(
        "Hasło musi mieć min. 8 znaków, zawierać dużą literę i cyfrę.",
        "error"
      );
      return;
    }

    if (password !== confirmPassword) {
      showAlert("Hasła muszą być takie same.", "error");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/auth/password-reset/confirm`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, password }),
        }
      );

      if (res.ok) {
        showAlert("Hasło zostało zresetowane", "success");
        navigate("/logowanie");
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

        <FormContainer title="Ustaw nowe hasło" onSubmit={handleSubmit}>
          <label>Nowe hasło</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <label>Powtórz hasło</label>
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <div className="submit-button">
            <Button type="submit" disabled={loading}>
              {loading ? <Spinner size="small" /> : "Zapisz nowe hasło"}
            </Button>
          </div>
        </FormContainer>
      </section>
    </div>
  );
}
