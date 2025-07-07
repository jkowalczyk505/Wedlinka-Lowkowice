import React from "react";
import { FaMapMarkerAlt, FaPhone, FaEnvelope } from "react-icons/fa";
import Button from "../components/common/Button";  // <-- import Twojego Buttona

function ContactPage() {
    return (
        <main className="page">
            <section className="contact-section white-section">
                <div className="contact-tile">

                    <div className="contact-info">
                        <h2>Dane kontaktowe</h2>
                        
                        <div className="contact-box">
                            <FaMapMarkerAlt className="icon" />
                            <p>ul. Przykładowa 11a<br/>11-111 Łowkowice</p>
                        </div>

                        <div className="contact-box">
                            <FaPhone className="icon" />
                            <p>+48 123 456 789</p>
                        </div>

                        <div className="contact-box">
                            <FaEnvelope className="icon" />
                            <p>kontakt@example.com</p>
                        </div>
                    </div>

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
                </div>
            </section>
        </main>
    )
}

export default ContactPage;