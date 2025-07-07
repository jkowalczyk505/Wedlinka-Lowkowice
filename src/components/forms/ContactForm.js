import React from "react";
import Button from "../common/Button";

export default function ContactForm() {
  return (
    <div className="contact-form">
      <div className="form-wrapper">
        <h2>Wypełnij formularz</h2>

        <label htmlFor="name">
          Twoje imię<span className="required">*</span>
        </label>
        <input id="name" type="text" placeholder="Jan Kowalski" />

        <label htmlFor="email">
          Twój email<span className="required">*</span>
        </label>
        <input id="email" type="email" placeholder="email@example.com" />

        <label htmlFor="message">
          Treść wiadomości<span className="required">*</span>
        </label>
        <textarea
          id="message"
          rows="5"
          placeholder="Napisz, w czym możemy pomóc..."
        />

        <Button type="submit" variant="red">
          Wyślij wiadomość
        </Button>
      </div>
    </div>
  );
}
