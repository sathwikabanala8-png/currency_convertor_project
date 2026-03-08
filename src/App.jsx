import Currency from "./Components/Currency/Currency";
import Auth from "./Components/Auth/Auth";
import "./App.css";
import { useEffect, useState } from "react";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [registeredUser, setRegisteredUser] = useState(null);

  useEffect(() => {
    const savedLoginState = localStorage.getItem("currency-app-login");
    const savedUser = localStorage.getItem("currency-app-user");

    if (savedUser) {
      try {
        setRegisteredUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem("currency-app-user");
      }
    }

    setIsLoggedIn(savedLoginState === "true");
  }, []);

  const handleRegister = (user) => {
    setRegisteredUser(user);
    localStorage.setItem("currency-app-user", JSON.stringify(user));
    localStorage.removeItem("currency-app-login");
    setIsLoggedIn(false);
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    localStorage.setItem("currency-app-login", "true");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("currency-app-login");
  };

  if (!isLoggedIn) {
    return (
      <Auth
        registeredUser={registeredUser}
        onRegister={handleRegister}
        onLogin={handleLogin}
      />
    );
  }

  return <Currency onLogout={handleLogout} />;
}

export default App;
