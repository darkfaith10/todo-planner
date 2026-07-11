export default function ScopeIcon({ level, active }) {
  const rings = [];
  for (let i = 0; i <= level; i++) {
    rings.push(
      <circle
        key={i}
        cx="12"
        cy="12"
        r={2.5 + i * 3.6}
        className={i === 0 ? 'ring-dot' : 'ring-line'}
      />
    );
  }
  return (
    <svg className={`scope-icon ${active ? 'is-active' : ''}`} viewBox="0 0 24 24" width="22" height="22">
      {rings}
    </svg>
  );
}
