import React, { useState } from "react";
import Button from "../common/Button";
import Spinner from "../common/Spinner";
import { useAlert } from "../common/AlertContext";

export default function ContactForm() {
  const { showAlert } = useAlert();
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const name = e.target.name.value.trim();
    const email = e.target.email.value.trim();
    const message = e.target.message.value.trim();

    if (!name || !email || !message) {
      showAlert("Wypełnij wszystkie pola!", "error");
      return;
    }

    try {
      setSending(true);

      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });

      if (!res.ok) throw new Error("Wysyłanie nie powiodło się");

      showAlert("Wiadomość została wysłana 🎉", "success");
      e.target.reset();
    } catch (err) {
      showAlert("Nie udało się wysłać wiadomości. Spróbuj ponownie.", "error");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="contact-form">
      <div className="form-wrapper">
        <h2>Wypełnij formularz</h2>

        <form onSubmit={handleSubmit} noValidate>
          <label htmlFor="name">
            Twoje imię<span className="required">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="Jan Kowalski"
            required
          />

          <label htmlFor="email">
            Twój email<span className="required">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="email@example.com"
            required
          />

          <label htmlFor="message">
            Treść wiadomości<span className="required">*</span>
          </label>
          <textarea
            id="message"
            name="message"
            rows="5"
            placeholder="Napisz, w czym możemy pomóc..."
            required
          />

          <p className="form-note">
            Wysyłając formularz, akceptujesz{" "}
            <a
              href="/files/Polityka_Prywatnosci.pdf"
              target="_blank"
              rel="noopener noreferrer"
            >
              politykę prywatności
            </a>
            .
          </p>

          <Button type="submit" variant="red" disabled={sending}>
            {sending ? <Spinner size="small" /> : "Wyślij wiadomość"}
          </Button>
        </form>
      </div>
    </div>
  );
}
