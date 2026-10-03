export default function Brand({ compact = false }) {
  return (
    <div className={`brand-lockup${compact ? ' brand-lockup-compact' : ''}`}>
      <img
        alt="Logo de Foto Minerva"
        className="brand-mark"
        onError={(event) => { event.currentTarget.hidden = true; }}
        src="/assets/foto-minerva-mark.png"
      />
      <span className="brand-name">Foto Minerva</span>
    </div>
  );
}