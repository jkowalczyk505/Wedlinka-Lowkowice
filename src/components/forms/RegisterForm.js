import { useState } from "react";
import FormContainer from "./FormContainer";
import Button from "../common/Button";
import Spinner from "../common/Spinner";
import { useAlert } from "../common/alert/AlertContext";

function RegisterForm() {
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showAlert } = useAlert();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { name, surname, phone, email, password, confirmPassword } = formData;

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      showAlert(
        "Hasło musi mieć min. 8 znaków, zawierać dużą literę i cyfrę.",
        "error"
      );
      setIsSubmitting(false);
      return;
    }

    if (password !== confirmPassword) {
      showAlert("Hasła muszą być takie same.", "error");
      setIsSubmitting(false);
      return;
    }

    if (!/^\d{9}$/.test(phone)) {
      showAlert("Telefon musi składać się z dokładnie 9 cyfr.", "error");
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, surname, phone, email, password }),
          credentials: "include",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        showAlert(data.error || "Rejestracja nie powiodła się.", "error");
        setIsSubmitting(false);
        return;
      }

      showAlert("Konto zostało założone pomyślnie!", "success");

      setFormData({
        name: "",
        surname: "",
        phone: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
    } catch (err) {
      showAlert("Błąd serwera.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormContainer title="Rejestracja" onSubmit={handleSubmit}>
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
            const digits = e.target.value.replace(/\D/g, "");
            if (digits.length <= 9) {
              setFormData((prev) => ({ ...prev, phone: digits }));
            }
          }}
          inputMode="numeric"
          pattern="\d{9}"
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
        <Button type="submit" variant="red" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Spinner size="small" /> &nbsp;Rejestracja...
            </>
          ) : (
            "Zarejestruj się"
          )}
        </Button>
      </div>
    </FormContainer>
  );
}

export default RegisterForm;
