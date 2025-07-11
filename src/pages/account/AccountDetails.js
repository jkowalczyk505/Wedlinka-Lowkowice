import { useState, useEffect } from "react";
import { useAuth } from "../../components/auth/AuthContext";
import Spinner from "../../components/common/Spinner";
import Button from "../../components/common/Button";
import { AuthFetch } from "../../components/auth/AuthFetch";
import InfoTip from "../../components/common/InfoTip";
import { useAlert } from "../../components/common/alert/AlertContext";

function AccountDetails() {
  const { setUser } = useAuth();
  const { showAlert } = useAlert();

  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    phone: "",
  });

  const [initialFormData, setInitialFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [email, setEmail] = useState("");

  const [emailData, setEmailData] = useState({
    newEmail: "",
    password: "",
  });
  const [emailChangeLoading, setEmailChangeLoading] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await AuthFetch(`${API_URL}/api/users/me`);
        const data = await res.json();

        if (res.ok) {
          const { name = "", surname = "", phone = "", email = "" } = data;
          const form = { name, surname, phone };

          setFormData(form);
          setInitialFormData(form);
          setEmail(email);
          setUser(data);
        } else {
          showAlert("Nie udało się pobrać danych użytkownika.", "error");
        }
      } catch (err) {
        showAlert("Błąd połączenia z serwerem.", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [API_URL, setUser]);

  const isChanged = () => {
    if (!initialFormData) return false;
    return (
      formData.name !== initialFormData.name ||
      formData.surname !== initialFormData.surname ||
      formData.phone !== initialFormData.phone
    );
  };

  const handleFieldFocus = () => {
    setEditing(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      const digits = value.replace(/\D/g, "");
      if (digits.length <= 9) {
        setFormData((prev) => ({ ...prev, [name]: digits }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCancel = () => {
    if (initialFormData) {
      setFormData(initialFormData);
      setEditing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await AuthFetch(`${API_URL}/api/users/me`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        showAlert(data.error || "Błąd podczas zapisu", "error");
        return;
      }

      showAlert("Dane zaktualizowane", "success");
      setInitialFormData(formData);
      setUser((prev) => ({ ...prev, ...formData }));
      setEditing(false);
    } catch (err) {
      showAlert("Błąd serwera", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleEmailFieldChange = (e) => {
    const { name, value } = e.target;
    setEmailData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEmailChangeSubmit = async (e) => {
    e.preventDefault();
    setEmailChangeLoading(true);

    try {
      const res = await AuthFetch(`${API_URL}/api/users/me/email`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(emailData),
      });

      const data = await res.json();

      if (!res.ok) {
        showAlert(data.error || "Błąd podczas zmiany e-maila", "error");
        return;
      }

      showAlert("E-mail został zmieniony", "success");
      setUser((prev) => ({ ...prev, email: emailData.newEmail }));
      setEmail(emailData.newEmail);
      setEmailData({ newEmail: "", password: "" });
    } catch (err) {
      showAlert("Błąd serwera", "error");
    } finally {
      setEmailChangeLoading(false);
    }
  };

  if (loading) return <Spinner fullscreen />;

  return (
    <div className="account-details">
      <div className="account-columns">
        <div className="personal-data">
          <h2>Dane osobowe</h2>
          <InfoTip>
            Te dane osobowe zostaną automatycznie wstawione podczas składania
            zamówienia, ale możesz je wtedy zmienić.
          </InfoTip>
          <form onSubmit={handleSubmit} className="form-wrapper">
            <label>Imię</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onFocus={handleFieldFocus}
              onChange={handleChange}
              required
            />

            <label>Nazwisko</label>
            <input
              type="text"
              name="surname"
              value={formData.surname}
              onFocus={handleFieldFocus}
              onChange={handleChange}
              required
            />

            <label>Telefon</label>
            <div className="phone-input-wrapper">
              <span className="prefix">+48</span>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onFocus={handleFieldFocus}
                onChange={handleChange}
                inputMode="numeric"
                pattern="\d{9}"
                required
              />
            </div>

            {editing && isChanged() && (
              <div
                className="submit-button"
                style={{ display: "flex", gap: "1rem" }}
              >
                <Button type="submit" variant="red" disabled={saving}>
                  {saving ? (
                    <>
                      <Spinner size="small" /> &nbsp;Zapisywanie...
                    </>
                  ) : (
                    "Zapisz zmiany"
                  )}
                </Button>
                <Button type="button" variant="beige" onClick={handleCancel}>
                  Anuluj
                </Button>
              </div>
            )}
          </form>
        </div>

        <div className="email-change">
          <h2>Zmień adres e-mail</h2>
          <form onSubmit={handleEmailChangeSubmit} className="form-wrapper">
            <label>Aktualny e-mail</label>
            <input type="email" value={email} disabled />

            <label>Nowy e-mail</label>
            <input
              type="email"
              name="newEmail"
              value={emailData.newEmail}
              onChange={handleEmailFieldChange}
              required
            />

            <label>Hasło</label>
            <input
              type="password"
              name="password"
              value={emailData.password}
              onChange={handleEmailFieldChange}
              required
            />

            <div className="submit-button">
              <Button type="submit" variant="red" disabled={emailChangeLoading}>
                {emailChangeLoading ? (
                  <>
                    <Spinner size="small" /> &nbsp;Zapisywanie...
                  </>
                ) : (
                  "Zmień e-mail"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AccountDetails;
