import LoginForm from "../components/forms/LoginForm";
import RegisterForm from "../components/forms/RegisterForm";
import bgImage from "../assets/auth.jpg";

function AuthPage() {
  return (
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
  );
}

export default AuthPage;
