import { useEffect, useRef, useState } from "react";
import "./Currency.css";

const CURRENCY_OPTIONS = [
  { code: "USD", name: "United States Dollar", symbol: "$" },
  { code: "INR", name: "Indian Rupee", symbol: "\u20B9" },
  { code: "EUR", name: "Euro", symbol: "\u20AC" },
  { code: "GBP", name: "British Pound", symbol: "\u00A3" },
  { code: "JPY", name: "Japanese Yen", symbol: "\u00A5" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF" },
  { code: "CNY", name: "Chinese Yuan", symbol: "\u00A5" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$" },
];

const SYMBOL_BY_CODE = CURRENCY_OPTIONS.reduce((acc, currency) => {
  acc[currency.code] = currency.symbol;
  return acc;
}, {});

function Currency({ onLogout }) {
  const [amount, setAmount] = useState("1");
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("INR");
  const [convertedAmount, setConvertedAmount] = useState(null);
  const [exchangeRate, setExchangeRate] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [autoConvert, setAutoConvert] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [activePage, setActivePage] = useState("converter");

  const requestIdRef = useRef(0);

  const validateAmount = (value) => {
    const trimmedAmount = value.trim();

    if (trimmedAmount === "") {
      return "Please enter an amount.";
    }

    const numericAmount = Number(trimmedAmount);

    if (!Number.isFinite(numericAmount)) {
      return "Please enter a valid number.";
    }

    if (numericAmount < 0) {
      return "Amount cannot be negative.";
    }

    if (numericAmount === 0) {
      return "Please enter an amount greater than 0.";
    }

    return "";
  };

  const formatAmount = (value, code) => {
    const symbol = SYMBOL_BY_CODE[code] || code;
    return `${symbol} ${value.toFixed(2)}`;
  };

  const convertCurrency = async ({ pushToHistory = true } = {}) => {
    const amountError = validateAmount(amount);

    if (amountError) {
      setError(amountError);
      setConvertedAmount(null);
      setExchangeRate(null);
      return;
    }

    const numericAmount = Number(amount);
    const requestId = ++requestIdRef.current;

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `https://api.frankfurter.app/latest?amount=${numericAmount}&from=${fromCurrency}&to=${toCurrency}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch conversion rate.");
      }

      const data = await response.json();
      const result = data?.rates?.[toCurrency];

      if (typeof result !== "number") {
        throw new Error("Invalid response from exchange rate service.");
      }

      if (requestId !== requestIdRef.current) {
        return;
      }

      const rate = result / numericAmount;
      const updatedAt = new Date();

      setConvertedAmount(result);
      setExchangeRate(rate);
      setLastUpdated(updatedAt);

      if (pushToHistory) {
        const newEntry = {
          id: `${Date.now()}-${Math.random()}`,
          amount: numericAmount,
          fromCurrency,
          toCurrency,
          convertedAmount: result,
        };

        setHistory((prev) => [newEntry, ...prev].slice(0, 8));
      }
    } catch (err) {
      if (requestId === requestIdRef.current) {
        setError(err.message || "Something went wrong.");
        setConvertedAmount(null);
        setExchangeRate(null);
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  };

  const handleConvert = () => {
    convertCurrency({ pushToHistory: true });
  };

  const handleSwap = () => {
    setIsSwapping(true);
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setConvertedAmount(null);
    setExchangeRate(null);
    setTimeout(() => setIsSwapping(false), 260);
  };

  const handleReset = () => {
    setAmount("");
    setFromCurrency("USD");
    setToCurrency("INR");
    setConvertedAmount(null);
    setExchangeRate(null);
    setLastUpdated(null);
    setHistory([]);
    setError("");
  };

  useEffect(() => {
    if (!autoConvert || activePage !== "converter") {
      return;
    }

    const amountError = validateAmount(amount);

    if (amountError) {
      setError(amountError);
      setConvertedAmount(null);
      setExchangeRate(null);
      return;
    }

    const timeoutId = setTimeout(() => {
      convertCurrency({ pushToHistory: false });
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [amount, fromCurrency, toCurrency, autoConvert, activePage]);

  const wrapperClassName = darkMode
    ? "currency-wrapper dark-mode"
    : "currency-wrapper";

  return (
    <div className={wrapperClassName}>
      <div className="currency-card">
        <div className="top-bar">
          <h1>Currency Converter</h1>
          <div className="top-bar-actions">
            <label className="toggle">
              <input
                type="checkbox"
                checked={darkMode}
                onChange={(e) => setDarkMode(e.target.checked)}
              />
              <span>{darkMode ? "Dark" : "Light"} Mode</span>
            </label>
            {onLogout && (
              <button className="logout-btn" type="button" onClick={onLogout}>
                Logout
              </button>
            )}
          </div>
        </div>

        <div className="page-switch">
          <button
            className={activePage === "converter" ? "page-btn active" : "page-btn"}
            type="button"
            onClick={() => setActivePage("converter")}
          >
            Converter
          </button>
          <button
            className={activePage === "history" ? "page-btn active" : "page-btn"}
            type="button"
            onClick={() => setActivePage("history")}
          >
            History
          </button>
        </div>

        {activePage === "converter" && (
          <div className="page-content">
            <div className="form-group">
              <label htmlFor="amount">Amount</label>
              <input
                id="amount"
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  if (error) {
                    setError("");
                  }
                }}
                placeholder="Enter amount"
              />
            </div>

            <div className={`row ${isSwapping ? "swapping" : ""}`}>
              <div className="form-group">
                <label htmlFor="from">From</label>
                <select
                  id="from"
                  value={fromCurrency}
                  onChange={(e) => setFromCurrency(e.target.value)}
                >
                  {CURRENCY_OPTIONS.map((currency) => (
                    <option key={currency.code} value={currency.code}>
                      {currency.code} - {currency.name}
                    </option>
                  ))}
                </select>
              </div>

              <button className="swap-btn" type="button" onClick={handleSwap}>
                Swap
              </button>

              <div className="form-group">
                <label htmlFor="to">To</label>
                <select
                  id="to"
                  value={toCurrency}
                  onChange={(e) => setToCurrency(e.target.value)}
                >
                  {CURRENCY_OPTIONS.map((currency) => (
                    <option key={currency.code} value={currency.code}>
                      {currency.code} - {currency.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="actions">
              <button
                className="convert-btn"
                type="button"
                onClick={handleConvert}
                disabled={loading}
              >
                {loading ? "Converting..." : "Convert"}
              </button>
              <button className="reset-btn" type="button" onClick={handleReset}>
                Reset
              </button>
            </div>

            <label className="auto-convert">
              <input
                type="checkbox"
                checked={autoConvert}
                onChange={(e) => setAutoConvert(e.target.checked)}
              />
              <span>Auto convert on input change</span>
            </label>

            {loading && <p className="loading">Loading...</p>}
            {error && <p className="error">{error}</p>}

            {convertedAmount !== null && !error && (
              <div className="result">
                <p>Converted Amount: {formatAmount(convertedAmount, toCurrency)}</p>
                <p>
                  Exchange Rate: 1 {fromCurrency} = {formatAmount(exchangeRate, toCurrency)}
                </p>
                {lastUpdated && (
                  <p className="updated-time">
                    Exchange rate last updated at{" "}
                    {lastUpdated.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {activePage === "history" && (
          <div className="page-content">
            <div className="history history-page">
              <h2>Recent Conversions</h2>
              {history.length === 0 ? (
                <p className="history-empty">No conversions yet.</p>
              ) : (
                <ul>
                  {history.map((entry) => (
                    <li key={entry.id}>
                      {entry.amount} {entry.fromCurrency} {"->"} {formatAmount(entry.convertedAmount, entry.toCurrency)}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Currency;
