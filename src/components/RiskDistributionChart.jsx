import { useMemo } from 'react';
import { getRiskLevel } from '../utils/riskLevel';
import { toPercent } from '../utils/format';

const SEGMENTS = [
  { key: '안전',     color: '#059669', label: '안전' },
  { key: '위험',     color: '#d97706', label: '위험' },
  { key: '매우 위험', color: '#dc2626', label: '매우 위험' },
];

const RADIUS = 54;
const STROKE = 14;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function RiskDistributionChart({ items, totalCustomers = 7043 }) {
  const distribution = useMemo(() => {
    const counts = { '위험': 0, '매우 위험': 0 };
    items.forEach((item) => {
      const threshold = item.threshold_value ?? item.threshold;
      const level = getRiskLevel(item.score, threshold);
      if (level === '위험' || level === '매우 위험') {
        counts[level]++;
      }
    });
    const riskTotal = counts['위험'] + counts['매우 위험'];
    const safeCount = Math.max(totalCustomers - riskTotal, 0);
    return { '안전': safeCount, '위험': counts['위험'], '매우 위험': counts['매우 위험'] };
  }, [items, totalCustomers]);

  const churnCount = distribution['위험'] + distribution['매우 위험'];
  const churnRate = totalCustomers > 0 ? churnCount / totalCustomers : 0;

  const segmentData = useMemo(() => {
    if (!totalCustomers) return [];
    let offset = 0;
    return SEGMENTS
      .filter((seg) => distribution[seg.key] > 0)
      .map((seg) => {
        const count = distribution[seg.key];
        const ratio = count / totalCustomers;
        const dashLen = ratio * CIRCUMFERENCE;
        const gapLen = CIRCUMFERENCE - dashLen;
        const currentOffset = offset;
        offset += dashLen;
        return { ...seg, count, ratio, dashLen, gapLen, offset: currentOffset };
      });
  }, [distribution, totalCustomers]);

  if (!items.length) {
    return (
      <section className="card summary-card muted-card">
        <p className="section-kicker">전체 고객 분포</p>
        <h2>이탈 위험 등급 분포</h2>
        <p>고위험 고객 데이터가 있으면 전체 고객 대비 비율을 표시합니다.</p>
      </section>
    );
  }

  return (
    <section className="card summary-card">
      <p className="section-kicker">전체 고객 분포</p>
      <h2>이탈 위험 등급 분포</h2>
      <p className="helper-text">
        전체 {totalCustomers.toLocaleString()}명 중 이탈 예상 고객 비율입니다.
      </p>

      <div className="chart-layout">
        <div className="donut-wrapper">
          <svg viewBox="0 0 140 140" className="donut-svg">
            <circle
              cx="70" cy="70" r={RADIUS}
              fill="none"
              stroke="#f0f2f5"
              strokeWidth={STROKE}
            />
            {segmentData.map((seg) => (
              <circle
                key={seg.key}
                cx="70" cy="70" r={RADIUS}
                fill="none"
                stroke={seg.color}
                strokeWidth={STROKE}
                strokeDasharray={`${seg.dashLen} ${seg.gapLen}`}
                strokeDashoffset={-seg.offset}
                strokeLinecap="butt"
                style={{ transition: 'stroke-dasharray 0.5s, stroke-dashoffset 0.5s' }}
              />
            ))}
            <text x="70" y="62" textAnchor="middle" dominantBaseline="central"
              style={{ fontSize: '1.35rem', fontWeight: 800, fill: 'var(--text-primary)', fontFamily: 'var(--font-sans)' }}>
              {totalCustomers.toLocaleString()}
            </text>
            <text x="70" y="82" textAnchor="middle" dominantBaseline="central"
              style={{ fontSize: '0.6rem', fontWeight: 600, fill: 'var(--text-tertiary)', fontFamily: 'var(--font-sans)' }}>
              전체 고객
            </text>
          </svg>
        </div>

        <div className="chart-legend">
          {segmentData.map((seg) => (
            <div key={seg.key} className="legend-row">
              <div className="legend-left">
                <span className="legend-dot" style={{ background: seg.color }} />
                <span className="legend-label">{seg.label}</span>
              </div>
              <div className="legend-right">
                <span className="legend-count">{seg.count.toLocaleString()}명</span>
                <span className="legend-pct">{toPercent(seg.ratio)}</span>
              </div>
            </div>
          ))}
          <div className="legend-divider" />
          <div className="legend-row">
            <div className="legend-left">
              <span className="legend-label legend-summary-label">이탈 예상 비율</span>
            </div>
            <div className="legend-right">
              <span className="legend-count">{churnCount.toLocaleString()}명</span>
              <span className="legend-pct legend-summary-value">{toPercent(churnRate)}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
