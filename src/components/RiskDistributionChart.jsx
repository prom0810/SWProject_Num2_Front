import { useMemo } from 'react';
import { getRiskLevel } from '../utils/riskLevel';
import { toPercent } from '../utils/format';

const SEGMENTS = [
  { key: '안전',     color: '#059669', bgColor: '#ecfdf5', label: '안전' },
  { key: '위험',     color: '#d97706', bgColor: '#fffbeb', label: '위험' },
  { key: '매우 위험', color: '#dc2626', bgColor: '#fef2f2', label: '매우 위험' },
];

const RADIUS = 54;
const STROKE = 14;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function RiskDistributionChart({ items }) {
  const distribution = useMemo(() => {
    const counts = { '안전': 0, '위험': 0, '매우 위험': 0 };
    items.forEach((item) => {
      const threshold = item.threshold_value ?? item.threshold;
      const level = getRiskLevel(item.score, threshold);
      counts[level]++;
    });
    return counts;
  }, [items]);

  const total = items.length;

  const segmentData = useMemo(() => {
    if (!total) return [];
    let offset = 0;
    return SEGMENTS
      .filter((seg) => distribution[seg.key] > 0)
      .map((seg) => {
        const count = distribution[seg.key];
        const ratio = count / total;
        const dashLen = ratio * CIRCUMFERENCE;
        const gapLen = CIRCUMFERENCE - dashLen;
        const currentOffset = offset;
        offset += dashLen;
        return { ...seg, count, ratio, dashLen, gapLen, offset: currentOffset };
      });
  }, [distribution, total]);

  const avgScore = useMemo(() => {
    if (!total) return 0;
    return items.reduce((sum, item) => sum + Number(item.score || 0), 0) / total;
  }, [items, total]);

  if (!total) {
    return (
      <section className="card summary-card muted-card">
        <p className="section-kicker">위험 분포</p>
        <h2>이탈 위험 등급 분포</h2>
        <p>고위험 고객 데이터가 있으면 등급별 비율을 표시합니다.</p>
      </section>
    );
  }

  return (
    <section className="card summary-card">
      <p className="section-kicker">위험 분포</p>
      <h2>이탈 위험 등급 분포</h2>
      <p className="helper-text">
        조회된 고위험 고객 {total}건의 등급별 비율입니다.
      </p>

      <div className="chart-layout">
        {/* Donut Chart */}
        <div className="donut-wrapper">
          <svg viewBox="0 0 140 140" className="donut-svg">
            {/* Background track */}
            <circle
              cx="70" cy="70" r={RADIUS}
              fill="none"
              stroke="#f0f2f5"
              strokeWidth={STROKE}
            />
            {/* Segments */}
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
            {/* Center text */}
            <text x="70" y="64" textAnchor="middle" dominantBaseline="central"
              style={{ fontSize: '1.5rem', fontWeight: 800, fill: 'var(--text-primary)', fontFamily: 'var(--font-sans)' }}>
              {total}
            </text>
            <text x="70" y="84" textAnchor="middle" dominantBaseline="central"
              style={{ fontSize: '0.65rem', fontWeight: 600, fill: 'var(--text-tertiary)', fontFamily: 'var(--font-sans)' }}>
              전체 건수
            </text>
          </svg>
        </div>

        {/* Legend */}
        <div className="chart-legend">
          {segmentData.map((seg) => (
            <div key={seg.key} className="legend-row">
              <div className="legend-left">
                <span className="legend-dot" style={{ background: seg.color }} />
                <span className="legend-label">{seg.label}</span>
              </div>
              <div className="legend-right">
                <span className="legend-count">{seg.count}건</span>
                <span className="legend-pct">{toPercent(seg.ratio)}</span>
              </div>
            </div>
          ))}
          <div className="legend-divider" />
          <div className="legend-row">
            <div className="legend-left">
              <span className="legend-label legend-summary-label">평균 이탈 점수</span>
            </div>
            <div className="legend-right">
              <span className="legend-pct legend-summary-value">{toPercent(avgScore)}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
