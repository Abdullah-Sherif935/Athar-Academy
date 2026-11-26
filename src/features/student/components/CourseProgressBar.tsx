export function CourseProgressBar({
  percent,
  label,
}: {
  percent: number;
  label?: string;
}) {
  const safe = Math.max(0, Math.min(100, percent));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
      {label ? (
        <div className="course-card__progress-row">
          <span>{label}</span>
          <span className="ltr-inline">{safe}%</span>
        </div>
      ) : null}
      <div
        className="progress-track"
        role="progressbar"
        aria-valuenow={safe}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? `${safe}%`}
      >
        <div className="progress-fill" style={{ width: `${safe}%` }} />
      </div>
    </div>
  );
}
