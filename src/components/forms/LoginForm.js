import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import FormContainer from "./FormContainer";
import Button from "../common/Button";
import Spinner from "../common/Spinner"; // <== dodaj to jeśli masz komponent spinnera
import { useAuth } from "../auth/AuthContext";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { setUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const redirectPath = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, remember }),
          credentials: "include",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Błąd logowania");
        setIsSubmitting(false);
        return;
      }

      setUser(data);
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setError("Błąd serwera");
      setIsSubmitting(false);
    }
  };

  return (
    <FormContainer title="Logowanie" onSubmit={handleSubmit}>
      <label>
        E-mail<span className="required">*</span>
      </label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <label>
        Hasło<span className="required">*</span>
      </label>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      {error && <div className="form-error">{error}</div>}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "0.5rem",
        }}
      >
        <label
          style={{ display: "flex", alignItems: "center", fontSize: "0.9rem" }}
        >
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            style={{ marginRight: "0.5rem" }}
          />
          Zapamiętaj mnie
        </label>

        <div className="form-link">
          <a href="#">Nie pamiętasz hasła?</a>
        </div>
      </div>

      <div className="submit-button">
        <Button type="submit" variant="red" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Spinner size="small" /> &nbsp;Logowanie...
            </>
          ) : (
            "Zaloguj się"
          )}
        </Button>
      </div>
    </FormContainer>
  );
}

export default LoginForm;
