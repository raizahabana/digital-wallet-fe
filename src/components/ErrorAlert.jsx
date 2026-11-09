export default function ErrorAlert({ error }) {
  if (!error) return null;
  const fieldMsgs = Object.values(error.fields || {}).flat();
  return (
    <div className="alert error" role="alert">
      <strong>{error.title}</strong>
      <p>{error.detail}</p>
      {fieldMsgs.length > 0 && (
        <ul>{fieldMsgs.map((m, i) => <li key={i}>{m}</li>)}</ul>
      )}
    </div>
  );
}