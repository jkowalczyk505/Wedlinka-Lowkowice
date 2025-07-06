import { useState } from "react";
import LoginForm from "../components/forms/LoginForm";
import RegisterForm from "../components/forms/RegisterForm";
import bgImage from "../assets/auth.jpg";
import Spinner from "../components/common/Spinner"; // zakładam że masz ten komponent

function AuthPage() {
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  return (
    <div className="auth-fullscreen-wrapper">
      {!isImageLoaded && (
        <div className="auth-spinner">
          <Spinner />
        </div>
      )}

      <img
        src={bgImage}
        alt="Background"
        onLoad={() => setIsImageLoaded(true)}
        style={{ display: "none" }}
      />

      {isImageLoaded && (
        <div
          className="auth-fullscreen"
          style={{ backgroundImage: `url(${bgImage})` }}
        >
          <div className="auth-overlay">
            <div className="auth-card-container">
              <div className="auth-card">
                <LoginForm />
              </div>
              <div className="auth-card">
                <RegisterForm />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AuthPage;
