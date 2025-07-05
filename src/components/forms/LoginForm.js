import { useState } from "react";
import FormContainer from "./FormContainer";
import Button from "../common/Button";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
          credentials: "include",
        }
      );

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Błąd logowania");
        return;
      }

      // TODO: zapamiętaj użytkownika i przekieruj
      window.location.href = "/";
    } catch (err) {
      setError("Błąd serwera");
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
        <Button type="submit" variant="red">
          Zaloguj się
        </Button>
      </div>
    </FormContainer>
  );
}

export default LoginForm;
