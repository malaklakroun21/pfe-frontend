import "./Credits.css";

const monthlyHighlights = [
  {
    id: "earned",
    title: "This Month",
    value: "+6",
    caption: "Credits earned",
    tone: "positive",
    direction: "up",
  },
  {
    id: "spent",
    title: "This Month",
    value: "-4",
    caption: "Credits spent",
    tone: "negative",
    direction: "down",
  },
  {
    id: "net",
    title: "Net Change",
    value: "+2",
    caption: "This month",
    tone: "accent",
    direction: "up",
  },
];

const earningTips = [
  {
    id: "teach",
    title: "Teach a Session",
    description: "Share your skills with others. Earn 1 credit for every hour you teach.",
    icon: "teach",
  },
  {
    id: "validate",
    title: "Validate Skills",
    description: "Help validate other members' skills to earn bonus credits.",
    icon: "validate",
  },
  {
    id: "quality",
    title: "Quality Teaching",
    description: "Maintain high ratings to unlock bonus credit opportunities.",
    icon: "quality",
  },
  {
    id: "complete",
    title: "Complete Sessions",
    description: "Finish all scheduled sessions to build your reputation.",
    icon: "complete",
  },
];

const transactions = [
  {
    id: "react-session",
    title: "Taught React Development to Alex Kim",
    date: "Apr 8, 2026",
    amount: "+1.5",
    balance: "12",
    tone: "positive",
  },
  {
    id: "spanish-session",
    title: "Learned Spanish from Sarah Chen",
    date: "Apr 7, 2026",
    amount: "-1",
    balance: "10.5",
    tone: "negative",
  },
  {
    id: "web-session",
    title: "Taught Web Development to Emma Wilson",
    date: "Apr 5, 2026",
    amount: "+1",
    balance: "11.5",
    tone: "positive",
  },
];

function CreditsBalanceIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="5.5" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M10 7.2v5.6M7.2 10H12.8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M15.4 13.6a4.85 4.85 0 1 1 0 6.85"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function TrendIcon({ direction = "up" }) {
  const path = direction === "down" ? "m5 9 4.2 4.2 3.2-3.2L19 16.5" : "m5 15 4.2-4.2 3.2 3.2L19 7.5";
  const elbow = direction === "down" ? "M13.75 16.5H19v-5.25" : "M13.75 7.5H19v5.25";

  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d={path}
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d={elbow}
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TipIcon({ icon }) {
  switch (icon) {
    case "teach":
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M5.5 8.5h8a2 2 0 0 1 2 2v7h-10v-9Z"
            fill="#f29a2b"
          />
          <path d="M15.5 6.5h3v11h-3" fill="#6c63ff" />
          <circle cx="9.5" cy="6.25" r="2.25" fill="#ffcf99" />
          <path
            d="M8 11.5h3M8 14h5"
            stroke="#ffffff"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M7 19.5v-2.75M14 19.5v-2.75"
            stroke="#9a4b16"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      );
    case "validate":
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="4" y="4" width="16" height="16" rx="3.5" fill="#57cd8b" />
          <path
            d="m8.25 12.25 2.5 2.5 5-5.5"
            stroke="#ffffff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "quality":
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="m12 3.8 2.52 5.1 5.63.82-4.07 3.96.96 5.62L12 16.65 6.96 19.3l.97-5.62-4.08-3.96 5.64-.82L12 3.8Z"
            fill="#f8cf37"
            stroke="#e6ae17"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "complete":
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="7" fill="#ff6d8d" />
          <circle cx="12" cy="12" r="4.2" fill="#ffd7e1" />
          <circle cx="12" cy="12" r="1.6" fill="#ef285f" />
          <path
            d="m14.8 9.2 4.7-4.2-.9 5.9"
            stroke="#20a5f7"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    default:
      return null;
  }
}

function TransactionSignIcon({ tone }) {
  const isPositive = tone === "positive";

  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="12" fill={isPositive ? "#d6f7df" : "#ffd9d7"} />
      <path
        d={isPositive ? "M12 7v10M7 12h10" : "M7 12h10"}
        stroke={isPositive ? "#00a63e" : "#ff3b30"}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Credits() {
  return (
    <section className="credits-page">
      <article className="credits-page__balance-card">
        <div className="credits-page__balance-topline">
          <span className="credits-page__balance-icon">
            <CreditsBalanceIcon />
          </span>
          <span>Current Balance</span>
        </div>

        <h2>12 Credits</h2>

        <div className="credits-page__totals">
          <div className="credits-page__total">
            <span>Total Earned</span>
            <strong>53</strong>
          </div>

          <div className="credits-page__total">
            <span>Total Spent</span>
            <strong>41</strong>
          </div>
        </div>
      </article>

      <div className="credits-page__summary-grid">
        {monthlyHighlights.map((item) => (
          <article
            key={item.id}
            className={`credits-page__summary-card credits-page__summary-card--${item.tone}`}
          >
            <div className="credits-page__summary-header">
              <span>{item.title}</span>
              <span className="credits-page__summary-icon">
                <TrendIcon direction={item.direction} />
              </span>
            </div>

            <strong>{item.value}</strong>
            <p>{item.caption}</p>
          </article>
        ))}
      </div>

      <section className="credits-page__panel">
        <h3 className="credits-page__section-title">How to Earn More Credits</h3>

        <div className="credits-page__tips-grid">
          {earningTips.map((tip) => (
            <article key={tip.id} className="credits-page__tip-card">
              <span className="credits-page__tip-icon">
                <TipIcon icon={tip.icon} />
              </span>

              <div className="credits-page__tip-copy">
                <h4>{tip.title}</h4>
                <p>{tip.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="credits-page__panel">
        <h3 className="credits-page__section-title">Transaction History</h3>

        <div className="credits-page__history-list">
          {transactions.map((transaction) => (
            <article key={transaction.id} className="credits-page__history-card">
              <div className="credits-page__history-main">
                <span
                  className={`credits-page__history-icon credits-page__history-icon--${transaction.tone}`}
                >
                  <TransactionSignIcon tone={transaction.tone} />
                </span>

                <div className="credits-page__history-copy">
                  <h4>{transaction.title}</h4>
                  <p>{transaction.date}</p>
                </div>
              </div>

              <div className="credits-page__history-meta">
                <strong
                  className={`credits-page__history-amount credits-page__history-amount--${transaction.tone}`}
                >
                  {transaction.amount}
                </strong>
                <span>Balance: {transaction.balance}</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}

export default Credits;
