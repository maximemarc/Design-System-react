import { useId, useState } from 'react';
import { Badge } from '@/components/ui';

const periods = {
  Semaine: {
    labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
    values: [32, 48, 39, 65, 54, 78, 91],
  },
  Mois: { labels: ['S1', 'S2', 'S3', 'S4'], values: [220, 310, 280, 420] },
};
export function CustomChart() {
  const [period, setPeriod] = useState<keyof typeof periods>('Semaine');
  const [type, setType] = useState('Courbe');
  const [active, setActive] = useState<number | null>(null);
  const id = useId();
  const { labels, values } = periods[period];
  const maximum = Math.ceil(Math.max(...values) / 50) * 50;
  const total = values.reduce((sum, value) => sum + value, 0);
  const points = values.map((value, index) => ({
    x: 48 + (index * 504) / (values.length - 1),
    y: 190 - (value / maximum) * 150,
  }));
  const path = points.map((point, index) => `${index ? 'L' : 'M'}${point.x},${point.y}`).join(' ');
  return (
    <div className="custom-chart">
      <div className="chart-controls">
        <div className="theme-options" aria-label="Période">
          {Object.keys(periods).map(key => (
            <button
              key={key}
              className={period === key ? 'selected' : ''}
              aria-pressed={period === key}
              onClick={() => {
                setPeriod(key as keyof typeof periods);
                setActive(null);
              }}
            >
              {key}
            </button>
          ))}
        </div>
        <div className="theme-options" aria-label="Type de graphique">
          {['Courbe', 'Barres'].map(key => (
            <button
              key={key}
              className={type === key ? 'selected' : ''}
              aria-pressed={type === key}
              onClick={() => setType(key)}
            >
              {key}
            </button>
          ))}
        </div>
      </div>
      <div className="chart-summary">
        <strong>
          {active === null ? total : values[active]}{' '}
          <span>{active === null ? 'visites au total' : `visites · ${labels[active]}`}</span>
        </strong>
        <Badge>Données fictives</Badge>
      </div>
      <svg className="custom-chart-svg" viewBox="0 0 600 230" role="img" aria-labelledby={id}>
        <title id={id}>
          Visites par {period.toLowerCase()} :{' '}
          {labels.map((label, index) => `${label} ${values[index]}`).join(', ')}
        </title>
        <defs>
          <linearGradient id={`${id}-fill`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--accent)" stopOpacity=".2" />
            <stop offset="1" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 0.5, 1].map(value => (
          <g key={value}>
            <line
              x1="48"
              x2="552"
              y1={190 - value * 150}
              y2={190 - value * 150}
              stroke="var(--border)"
              strokeDasharray="4 4"
            />
            <text x="34" y={194 - value * 150} textAnchor="end" fill="var(--muted)" fontSize="11">
              {maximum * value}
            </text>
          </g>
        ))}
        {type === 'Courbe' && (
          <>
            <path d={`${path} L552,190 L48,190 Z`} fill={`url(#${id}-fill)`} />
            <path d={path} fill="none" stroke="var(--accent)" strokeWidth="3" />
          </>
        )}
        {points.map((point, index) => (
          <g key={index}>
            {type === 'Barres' ? (
              <rect
                x={point.x - 18}
                y={point.y}
                width="36"
                height={190 - point.y}
                rx="4"
                fill="var(--accent)"
                opacity={active === null || active === index ? 1 : 0.4}
              />
            ) : (
              <circle
                cx={point.x}
                cy={point.y}
                r={active === index ? 6 : 4}
                fill="var(--surface)"
                stroke="var(--accent)"
                strokeWidth="3"
              />
            )}
            <text x={point.x} y="216" textAnchor="middle" fill="var(--muted)" fontSize="12">
              {labels[index]}
            </text>
          </g>
        ))}
      </svg>
      <div className="chart-point-controls" aria-label="Explorer les données">
        {labels.map((label, index) => (
          <button
            key={label}
            aria-pressed={active === index}
            className={active === index ? 'selected' : ''}
            onMouseEnter={() => setActive(index)}
            onFocus={() => setActive(index)}
            onClick={() => setActive(active === index ? null : index)}
          >
            {label}
            <span>{values[index]}</span>
          </button>
        ))}
      </div>
      <button className="chart-reset" onClick={() => setActive(null)}>
        Afficher le total
      </button>
    </div>
  );
}
