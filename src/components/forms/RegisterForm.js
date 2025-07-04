import { useState } from "react";
import FormContainer from "./FormContainer";
import Button from "../common/Button";

function RegisterForm() {
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const { name, surname, phone, email, password, confirmPassword } = formData;

    if (password !== confirmPassword) {
      setError("Hasła muszą być takie same.");
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, surname, phone, email, password }),
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Rejestracja nie powiodła się.");
        return;
      }

      setSuccess("Konto zostało założone pomyślnie!");
      // Opcjonalnie przekierowanie:
      // window.location.href = "/";
    } catch (err) {
      setError("Błąd serwera.");
    }
  };

  return (
    <FormContainer title="Rejestracja" onSubmit={handleSubmit}>
      {success && <div className="form-success">{success}</div>}

      <label>
        Imię <span className="required">*</span>
      </label>
      <input
        type="text"
        name="name"
        value={formData.name}
        onChange={handleChange}
        required
      />

      <label>
        Nazwisko<span className="required">*</span>
      </label>
      <input
        type="text"
        name="surname"
        value={formData.surname}
        onChange={handleChange}
        required
      />

      <label>
        Telefon<span className="required">*</span>
      </label>
      <div className="phone-input-wrapper">
        <span className="prefix">+48</span>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={(e) => {
            const onlyDigits = e.target.value.replace(/\D/g, "");
            if (onlyDigits.length <= 9) {
              setFormData((prev) => ({ ...prev, phone: onlyDigits }));
            }
          }}
          required
        />
      </div>

      <label>
        E-mail<span className="required">*</span>
      </label>
      <input
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        required
      />

      <label>
        Hasło<span className="required">*</span>
      </label>
      <input
        type="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        required
      />

      <label>
        Powtórz hasło<span className="required">*</span>
      </label>
      <input
        type="password"
        name="confirmPassword"
        value={formData.confirmPassword}
        onChange={handleChange}
        required
      />

      {error && <div className="form-error">{error}</div>}

      <div className="form-note" id="auth_polityka">
        Twoje dane osobowe zostaną użyte do obsługi twojej wizyty na naszej
        stronie, zarządzania dostępem do twojego konta oraz w innych celach
        opisanych w naszej{" "}
        <a href="/Polityka_Prywatnosci.pdf" download>
          polityce prywatności
        </a>
        .
      </div>

      <div className="submit-button">
        <Button type="submit" variant="red">
          Zarejestruj się
        </Button>
      </div>
    </FormContainer>
  );
}

export default RegisterForm;
