import { useEffect, useState } from "react";
import { creditApi, userApi } from "../../../api/client.js";
import { useAuthSession } from "../../../authSession.js";
import "./Credits.css";

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

function readNumericValue(value) {
  return Number(value?.$numberDecimal ?? value?.toString?.() ?? value ?? 0);
}

function formatSignedAmount(amount, isPositive) {
  return `${isPositive ? "+" : "-"}${amount}`;
}

function formatDateLabel(dateValue) {
  const parsedDate = new Date(dateValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Unknown date";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsedDate);
}

function buildTransactionTitle(transaction, currentUserId) {
  if (transaction.toUser === currentUserId) {
    return `Credits received from ${transaction.fromUser}`;
  }

  return `Credits spent with ${transaction.toUser}`;
}

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
  const { user } = useAuthSession();
  const [currentBalance, setCurrentBalance] = useState(0);
  const [monthlyHighlights, setMonthlyHighlights] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [totals, setTotals] = useState({ earned: 0, spent: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isActive = true;

    async function loadCredits() {
      if (!user?.userId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setErrorMessage("");

      try {
        const [creditProfile, history, currentUser] = await Promise.all([
          creditApi.getMe().catch(() => null),
          creditApi.getHistory(),
          userApi.getCurrentUser(),
        ]);

        if (!isActive) {
          return;
        }

        const balance = readNumericValue(
          creditProfile?.balance ?? currentUser?.timeCredits,
        );
        const historyItems = Array.isArray(creditProfile?.history)
          ? creditProfile.history
          : Array.isArray(history)
            ? history
            : [];
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        let totalEarned = 0;
        let totalSpent = 0;
        let monthEarned = 0;
        let monthSpent = 0;
        let rollingBalance = balance;

        const mappedTransactions = historyItems.map((transaction, index) => {
          const isPositive = transaction.toUser === user.userId;
          const amount = Number(transaction.amount || 0);
          const createdAt = new Date(transaction.createdAt);

          if (isPositive) {
            totalEarned += amount;
          } else {
            totalSpent += amount;
          }

          if (
            !Number.isNaN(createdAt.getTime()) &&
            createdAt.getMonth() === currentMonth &&
            createdAt.getFullYear() === currentYear
          ) {
            if (isPositive) {
              monthEarned += amount;
            } else {
              monthSpent += amount;
            }
          }

          const balanceAfter = rollingBalance;
          rollingBalance -= isPositive ? amount : -amount;

          return {
            id: transaction._id || `${transaction.sessionId}-${index}`,
            title: buildTransactionTitle(transaction, user.userId),
            date: formatDateLabel(transaction.createdAt),
            amount: formatSignedAmount(amount, isPositive),
            balance: balanceAfter,
            tone: isPositive ? "positive" : "negative",
          };
        });

        setCurrentBalance(balance);
        setTotals({
          earned: totalEarned,
          spent: totalSpent,
        });
        setMonthlyHighlights([
          {
            id: "earned",
            title: "This Month",
            value: `+${monthEarned}`,
            caption: "Credits earned",
            tone: "positive",
            direction: "up",
          },
          {
            id: "spent",
            title: "This Month",
            value: `-${monthSpent}`,
            caption: "Credits spent",
            tone: "negative",
            direction: "down",
          },
          {
            id: "net",
            title: "Net Change",
            value: `${monthEarned - monthSpent >= 0 ? "+" : ""}${monthEarned - monthSpent}`,
            caption: "This month",
            tone: monthEarned - monthSpent >= 0 ? "accent" : "negative",
            direction: monthEarned - monthSpent >= 0 ? "up" : "down",
          },
        ]);
        setTransactions(mappedTransactions);
      } catch (error) {
        if (!isActive) {
          return;
        }

        setErrorMessage(error.message);
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadCredits();

    return () => {
      isActive = false;
    };
  }, [user?.userId]);

  return (
    <section className="credits-page">
      {errorMessage ? <p>{errorMessage}</p> : null}

      <article className="credits-page__balance-card">
        <div className="credits-page__balance-topline">
          <span className="credits-page__balance-icon">
            <CreditsBalanceIcon />
          </span>
          <span>Current Balance</span>
        </div>

        <h2>{currentBalance} Credits</h2>

        <div className="credits-page__totals">
          <div className="credits-page__total">
            <span>Total Earned</span>
            <strong>{totals.earned}</strong>
          </div>

          <div className="credits-page__total">
            <span>Total Spent</span>
            <strong>{totals.spent}</strong>
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
          {isLoading ? (
            <p>Loading credits...</p>
          ) : transactions.length > 0 ? (
            transactions.map((transaction) => (
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
            ))
          ) : (
            <p>No credit transactions yet.</p>
          )}
        </div>
      </section>
    </section>
  );
}

export default Credits;
