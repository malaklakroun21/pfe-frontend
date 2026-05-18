import "./XP.css";

function formatHistoryDate(value) {
  if (!value) {
    return "Recently";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return "Recently";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsed);
}

export default function XPHistoryList({ items = [] }) {
  return (
    <section className="xp-history" aria-label="Recent XP activity">
      <h4 className="xp-history__title">Recent XP activity</h4>

      {items.length === 0 ? (
        <p className="xp-history__empty">Complete teaching sessions to earn XP.</p>
      ) : (
        <ul className="xp-history__list">
          {items.map((entry) => (
            <li
              key={`${entry.sessionId || entry.source}-${entry.createdAt}-${entry.amount}`}
              className="xp-history__item"
            >
              <div className="xp-history__copy">
                <p className="xp-history__description">
                  {entry.description || "XP earned"}
                </p>
                <p className="xp-history__date">{formatHistoryDate(entry.createdAt)}</p>
              </div>
              <span className="xp-history__amount">+{entry.amount} XP</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
