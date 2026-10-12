import { campsData } from '../data/camps';

// Organisers of the camps in the catalogue — taken from the data, so the strip
// only ever names programmes the site actually offers.
const ITEMS = [...new Set(campsData.map((c) => c.org))];

export default function Ticker() {
  const track = [...ITEMS, ...ITEMS];
  return (
    <div className="ticker-wrap">
      <div className="ticker-track">
        <div className="ticker-item">
          {track.map((name, i) => (
            <span key={i}>{name}{i < track.length - 1 && <span className="ticker-dot" style={{ display: 'inline-block', width: 4, height: 4, borderRadius: '50%', background: 'var(--navy)', opacity: 0.35, margin: '0 18px', verticalAlign: 'middle' }} />}</span>
          ))}
        </div>
        <div className="ticker-item" aria-hidden="true">
          {track.map((name, i) => (
            <span key={i}>{name}{i < track.length - 1 && <span style={{ display: 'inline-block', width: 4, height: 4, borderRadius: '50%', background: 'var(--navy)', opacity: 0.35, margin: '0 18px', verticalAlign: 'middle' }} />}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
