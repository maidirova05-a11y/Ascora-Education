const ITEMS = [
  'University of Oxford','Imperial College London','MIT','University of Toronto','TU Munich',
  'Sciences Po','King\'s College London','Varna Education Centre','Bright Language Centre','Abbotsholme School'
];

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
