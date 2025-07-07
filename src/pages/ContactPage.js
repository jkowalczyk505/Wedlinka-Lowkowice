import React from "react";
import { FaMapMarkerAlt, FaPhone, FaEnvelope } from "react-icons/fa";
import ContactForm from "../components/forms/ContactForm";

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

                    <ContactForm />
                </div>
            </section>
        </main>
    )
}

export default ContactPage;