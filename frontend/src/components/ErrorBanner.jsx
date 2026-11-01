export default function ErrorBanner({ mensaje }) {
  if (!mensaje) return null;
  return <div className="error-banner">{mensaje}</div>;
}
