import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { parseError } from "../api/client";
import ErrorAlert from "../components/ErrorAlert";
import "./Login.css";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(form.email, form.password);
      navigate("/");
    } catch (err) {
      setError(parseError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <main className="auth-phone">
        {/* Lime hero */}
        <section className="auth-hero">
          <svg className="auth-bolt" viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
            <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z" fill="currentColor" />
          </svg>

          <div className="auth-hero-text">
            <h1 className="auth-title">Digital Wallet</h1>
            <p className="auth-sub">Secure ledger service</p>
            <div className="auth-chips">
              <span>Deposit</span>
              <span>Transfer</span>
              <span>+1</span>
            </div>
          </div>

          <span className="auth-arrow" aria-hidden="true">↗</span>
        </section>

        {/* Heading + form */}
        <div className="auth-side">
          <h2 className="auth-heading">Sign in</h2>

          <form className="auth-panel" onSubmit={submit}>
            <ErrorAlert error={error} />

            <label className="auth-field">
              <span>Email</span>
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </label>

            <label className="auth-field">
              <span>Password</span>
              <input
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </label>

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}