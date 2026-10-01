export default function Brand({ compact = false }) {
  return (
    <div className={`brand-lockup${compact ? ' brand-lockup-compact' : ''}`}>
      <span className="brand-mark" aria-hidden="true">AD</span>
      <span className="brand-name">Apta <strong>Digital</strong></span>
    </div>
  );
}