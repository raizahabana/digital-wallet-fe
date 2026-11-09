import { useCallback, useEffect, useState } from "react";
import api, { parseError } from "../api/client";
import { useAuth } from "../context/AuthContext";
import ErrorAlert from "../components/ErrorAlert";

// Positive, max 2 decimal places (mirrors backend rule; backend remains the authority)
const isValidAmount = (v) => /^\d+(\.\d{1,2})?$/.test(v) && Number(v) > 0;

const money = (v, cur) =>
  new Intl.NumberFormat(undefined, { style: "currency", currency: cur || "USD" }).format(v);

export default function Dashboard() {
  const { logout } = useAuth();
  const [wallet, setWallet] = useState(null);
  const [error, setError] = useState(null);

  const loadWallet = useCallback(async () => {
    try {
      const { data } = await api.get("/wallet");
      setWallet(data.data ?? data); // adjust to your WalletResource
    } catch (err) {
      setError(parseError(err));
    }
  }, []);

  useEffect(() => { loadWallet(); }, [loadWallet]);

  return (
    <div className="container">
      <header>
        <h1>My Wallet</h1>
        <button onClick={logout} className="secondary">Log out</button>
      </header>

      <ErrorAlert error={error} />

      <section className="card balance">
        <span>Available balance</span>
        <h2>{wallet ? money(wallet.balance, wallet.currency) : "…"}</h2>
      </section>

      <div className="grid">
        <AmountForm title="Deposit" endpoint="/wallet/deposit" onDone={loadWallet} />
        <AmountForm title="Transfer" endpoint="/wallet/transfer" withRecipient onDone={loadWallet} />
      </div>

      <StatementCard />

      <section className="card">
        <h3>Latest transactions</h3>
        <table>
          <thead>
            <tr><th>Date</th><th>Type</th><th>Amount</th><th>Reference</th></tr>
          </thead>
          <tbody>
            {wallet?.transactions?.length ? (
              wallet.transactions.map((t) => (
                <tr key={t.id}>
                  <td>{new Date(t.created_at).toLocaleString()}</td>
                  <td><span className={`badge ${t.type}`}>{t.type.replace("_", " ")}</span></td>
                  <td>{money(t.amount, wallet.currency)}</td>
                  <td className="mono">{t.reference_id?.slice(0, 8) ?? "—"}</td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="4">No transactions yet.</td></tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function AmountForm({ title, endpoint, withRecipient = false, onDone }) {
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess("");

    if (!isValidAmount(amount)) {
      return setError({
        title: "Invalid amount",
        detail: "Enter a positive amount with at most 2 decimal places.",
        fields: {},
      });
    }

    setLoading(true);
    try {
      const body = withRecipient
        ? { recipient_email: recipient, amount }
        : { amount };
      await api.post(endpoint, body);
      setSuccess(`${title} successful.`);
      setAmount("");
      setRecipient("");
      onDone();
    } catch (err) {
      setError(parseError(err)); // e.g. "Insufficient wallet balance."
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="card" onSubmit={submit}>
      <h3>{title}</h3>
      <ErrorAlert error={error} />
      {success && <div className="alert success">{success}</div>}
      {withRecipient && (
        <label>Recipient email
          <input type="email" required value={recipient}
            onChange={(e) => setRecipient(e.target.value)} />
        </label>
      )}
      <label>Amount
        <input inputMode="decimal" placeholder="0.00" required value={amount}
          onChange={(e) => setAmount(e.target.value)} />
      </label>
      <button disabled={loading}>{loading ? "Processing…" : title}</button>
    </form>
  );
}