import { useState } from "react";
import "./Auth.css";

function Auth({ registeredUser, onRegister, onLogin }) {
  const [mode, setMode] = useState(registeredUser ? "login" : "register");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [registerForm, setRegisterForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  const updateRegisterField = (field, value) => {
    setRegisterForm((prev) => ({ ...prev, [field]: value }));
    if (error) {
      setError("");
    }
  };

  const updateLoginField = (field, value) => {
    setLoginForm((prev) => ({ ...prev, [field]: value }));
    if (error) {
      setError("");
    }
  };

  const handleRegisterSubmit = (event) => {
    event.preventDefault();
    const fullName = registerForm.fullName.trim();
    const email = registerForm.email.trim().toLowerCase();
    const password = registerForm.password.trim();
    const confirmPassword = registerForm.confirmPassword.trim();

    if (!fullName || !email || !password || !confirmPassword) {
      setError("Please fill all registration fields.");
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    onRegister({ fullName, email, password });
    setSuccess("Registration completed. Please log in.");
    setError("");
    setMode("login");
    setLoginForm({ email, password: "" });
  };

  const handleLoginSubmit = (event) => {
    event.preventDefault();
    const email = loginForm.email.trim().toLowerCase();
    const password = loginForm.password.trim();

    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }

    if (!registeredUser) {
      setError("Please register first.");
      setMode("register");
      return;
    }

    if (registeredUser.email !== email || registeredUser.password !== password) {
      setError("Invalid credentials.");
      return;
    }

    setError("");
    setSuccess("");
    onLogin();
  };

  const isRegisterMode = mode === "register";

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <aside className="auth-info">
          <p className="auth-badge">Currency Pro</p>
          <h1>Secure Access Portal</h1>
          <p>
            Create your account first, then sign in to access your currency
            converter dashboard.
          </p>
        </aside>

        <section className="auth-form-panel">
          <div className="auth-tabs">
            <button
              className={isRegisterMode ? "auth-tab active" : "auth-tab"}
              type="button"
              onClick={() => setMode("register")}
            >
              Register
            </button>
            <button
              className={!isRegisterMode ? "auth-tab active" : "auth-tab"}
              type="button"
              onClick={() => setMode("login")}
              disabled={!registeredUser}
              title={!registeredUser ? "Complete registration first" : ""}
            >
              Login
            </button>
          </div>

          {success && <p className="auth-success">{success}</p>}
          {error && <p className="auth-error">{error}</p>}

          {isRegisterMode ? (
            <form className="auth-form" onSubmit={handleRegisterSubmit}>
              <label htmlFor="fullName">Full Name</label>
              <input
                id="fullName"
                type="text"
                value={registerForm.fullName}
                onChange={(event) =>
                  updateRegisterField("fullName", event.target.value)
                }
                placeholder="Your name"
              />

              <label htmlFor="registerEmail">Email</label>
              <input
                id="registerEmail"
                type="email"
                value={registerForm.email}
                onChange={(event) =>
                  updateRegisterField("email", event.target.value)
                }
                placeholder="you@example.com"
              />

              <label htmlFor="registerPassword">Password</label>
              <input
                id="registerPassword"
                type="password"
                value={registerForm.password}
                onChange={(event) =>
                  updateRegisterField("password", event.target.value)
                }
                placeholder="Minimum 6 characters"
              />

              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                value={registerForm.confirmPassword}
                onChange={(event) =>
                  updateRegisterField("confirmPassword", event.target.value)
                }
                placeholder="Retype password"
              />

              <button type="submit" className="auth-submit">
                Complete Registration
              </button>
            </form>
          ) : (
            <form className="auth-form" onSubmit={handleLoginSubmit}>
              <label htmlFor="loginEmail">Email</label>
              <input
                id="loginEmail"
                type="email"
                value={loginForm.email}
                onChange={(event) => updateLoginField("email", event.target.value)}
                placeholder="Registered email"
              />

              <label htmlFor="loginPassword">Password</label>
              <input
                id="loginPassword"
                type="password"
                value={loginForm.password}
                onChange={(event) =>
                  updateLoginField("password", event.target.value)
                }
                placeholder="Your password"
              />

              <button type="submit" className="auth-submit">
                Login
              </button>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}

export default Auth;
