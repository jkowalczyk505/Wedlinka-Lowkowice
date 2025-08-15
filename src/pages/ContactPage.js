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
              <p>
                ul. Księdza Rigola 42
                <br />
                46-211 Łowkowice
              </p>
            </div>

            <div className="contact-box">
              <FaPhone className="icon" />
              <p>+48 500 877 347</p>
            </div>

            <div className="contact-box">
              <FaEnvelope className="icon" />
              <p>kontakt@wedlinkalowkowice.pl</p>
            </div>
          </div>

          <ContactForm />
        </div>
      </section>
    </main>
  );
}

export default ContactPage;
