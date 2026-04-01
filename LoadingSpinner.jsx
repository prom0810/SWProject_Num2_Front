import StatusBadge from './StatusBadge';
import { toPercent } from '../utils/format';

export default function ResultCard({ result }) {
  if (!result) return null;

  return (
    <section className="card result-card">
      <div className="card-header-row">
        <div>
          <p className="section-kicker">예측 결과</p>
          <h2>예측 결과</h2>
        </div>
        <StatusBadge predictionLabel={result.prediction_label} />
      </div>

      <div className="result-grid">
        <div>
          <span className="meta-label">고객 ID</span>
          <strong>{result.customer_id}</strong>
        </div>
        <div>
          <span className="meta-label">이탈 점수</span>
          <strong>{toPercent(result.score)}</strong>
        </div>
        <div>
          <span className="meta-label">판단 기준값</span>
          <strong>{toPercent(result.threshold)}</strong>
        </div>
        <div>
          <span className="meta-label">예측 결과</span>
          <strong>{result.prediction_label === '1' || result.prediction_label === 1 ? '이탈 위험' : '유지 예상'}</strong>
        </div>
      </div>
    </section>
  );
}
