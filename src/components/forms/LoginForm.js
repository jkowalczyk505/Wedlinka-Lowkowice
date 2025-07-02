import { useState } from "react";
import FormContainer from "./FormContainer";
import Button from "../common/Button";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Błąd logowania");
        return;
      }

      // TODO: przekierowanie / zapamiętanie użytkownika
      window.location.href = "/";
    } catch (err) {
      setError("Błąd serwera");
    }
  };

  return (
    <FormContainer title="Logowanie" onSubmit={handleSubmit}>
      {error && <div className="form-error">{error}</div>}
      <label>Email</label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <label>Hasło</label>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <div className="submit-button">
        <Button type="submit" variant="red">
          Zaloguj się
        </Button>
      </div>
    </FormContainer>
  );
}

export default LoginForm;
