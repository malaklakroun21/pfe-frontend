import { useEffect, useState } from "react";
import { leaderboardApi } from "../../../api/client.js";
import Header from "../Layout/Header/Header.jsx";
import ViewFrame from "../Layout/ViewFrame/ViewFrame.jsx";
import "./Leaderboards.css";

const PAGE_SIZE = 20;

function TrophyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M8 4.5h8v4.25a4 4 0 0 1-8 0Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 6H4.5v1.25a3.25 3.25 0 0 0 3.25 3.25H8" stroke="currentColor" strokeWidth="1.8" />
      <path d="M16 6h3.5v1.25a3.25 3.25 0 0 1-3.25 3.25H16" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 12.75v3.5M9.5 20h5M10 16.25h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M19 7.5v4h-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 16.5v-4h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17.3 10.1A5.9 5.9 0 0 0 7.2 8.2L5 10.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M6.7 13.9a5.9 5.9 0 0 0 10.1 1.9l2.2-2.3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function formatDate(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
}

function formatCycle(cycle) {
  if (!cycle?.startsAt || !cycle?.endsAt) {
    return "Current week";
  }

  const endDate = new Date(cycle.endsAt);
  endDate.setUTCDate(endDate.getUTCDate() - 1);

  return `${formatDate(cycle.startsAt)} - ${formatDate(endDate.toISOString())}`;
}

function formatReset(cycle) {
  if (!cycle?.endsAt) {
    return "Resets Monday";
  }

  const date = new Date(cycle.endsAt);

  if (Number.isNaN(date.getTime())) {
    return "Resets Monday";
  }

  return `Resets ${new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(date)}`;
}

function LeaderboardAvatar({ entry }) {
  if (entry.avatar) {
    return (
      <span className="leaderboards-page__avatar" aria-hidden="true">
        <img src={entry.avatar} alt="" />
      </span>
    );
  }

  return <span className="leaderboards-page__avatar">{entry.initials || "??"}</span>;
}

function RankBadge({ rank }) {
  const podiumClass = rank <= 3 ? ` leaderboards-page__rank--top-${rank}` : "";
  return <span className={`leaderboards-page__rank${podiumClass}`}>#{rank}</span>;
}

function Leaderboards() {
  const [leaderboard, setLeaderboard] = useState(null);
  const [page, setPage] = useState(1);
  const [refreshCount, setRefreshCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isActive = true;

    async function loadLeaderboard() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const data = await leaderboardApi.getWeeklyXp({ page, limit: PAGE_SIZE });

        if (!isActive) {
          return;
        }

        setLeaderboard(data);
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

    loadLeaderboard();

    return () => {
      isActive = false;
    };
  }, [page, refreshCount]);

  const entries = Array.isArray(leaderboard?.entries) ? leaderboard.entries : [];
  const pagination = leaderboard?.pagination || {};
  const tier = leaderboard?.tier;
  const rankedCount = pagination.totalRankedUsers || 0;
  const tierCount = pagination.totalTierUsers || 0;

  return (
    <ViewFrame header={<Header />}>
      <section className="leaderboards-page">
        <div className="leaderboards-page__hero">
          <div className="leaderboards-page__hero-copy">
            <span className="leaderboards-page__eyebrow">Weekly XP leaderboard</span>
            <h1>Your tier, your race</h1>
            <p>
              {tier
                ? `Level ${tier.level} ${tier.title} members only.`
                : "Rankings are filtered to your level tier automatically."}
            </p>
          </div>

          <div className="leaderboards-page__hero-card">
            <span className="leaderboards-page__hero-icon">
              <TrophyIcon />
            </span>
            <strong>{formatCycle(leaderboard?.cycle)}</strong>
            <span>{formatReset(leaderboard?.cycle)}</span>
          </div>
        </div>

        <div className="leaderboards-page__summary">
          <article>
            <span>Tier</span>
            <strong>{tier ? `Level ${tier.level}` : "--"}</strong>
            <p>{tier?.title || "Loading"}</p>
          </article>

          <article>
            <span>Ranked this week</span>
            <strong>{rankedCount.toLocaleString()}</strong>
            <p>{tierCount.toLocaleString()} total in your tier</p>
          </article>

          <article>
            <span>Cycle</span>
            <strong>Monday</strong>
            <p>XP resets weekly, totals stay intact</p>
          </article>
        </div>

        <div className="leaderboards-page__board">
          <div className="leaderboards-page__board-header">
            <div>
              <h2>Top XP earners</h2>
              <p>{tier ? `Only Level ${tier.level} ${tier.title} users are included.` : "Loading tier scope."}</p>
            </div>

            <button
              type="button"
              onClick={() => {
                if (page === 1) {
                  setRefreshCount((currentCount) => currentCount + 1);
                  return;
                }

                setPage(1);
              }}
              disabled={isLoading && page === 1}
            >
              <span aria-hidden="true">
                <RefreshIcon />
              </span>
              Refresh
            </button>
          </div>

          {errorMessage ? <div className="leaderboards-page__notice">{errorMessage}</div> : null}

          {isLoading ? (
            <div className="leaderboards-page__loading">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="leaderboards-page__skeleton" />
              ))}
            </div>
          ) : entries.length > 0 ? (
            <div className="leaderboards-page__list">
              {entries.map((entry) => (
                <article key={entry.userId} className="leaderboards-page__entry">
                  <RankBadge rank={entry.rank} />
                  <LeaderboardAvatar entry={entry} />

                  <div className="leaderboards-page__member">
                    <h3>{entry.displayName}</h3>
                    <p>Level {entry.level} {entry.levelTitle}</p>
                  </div>

                  {entry.streak?.current > 0 ? (
                    <span className="leaderboards-page__streak">{entry.streak.current} day streak</span>
                  ) : null}

                  <strong className="leaderboards-page__xp">
                    {Number(entry.weeklyXp || 0).toLocaleString()} XP
                  </strong>
                </article>
              ))}
            </div>
          ) : (
            <div className="leaderboards-page__empty">
              <h2>No weekly XP yet</h2>
              <p>Once someone in your level tier earns XP this week, rankings will appear here.</p>
            </div>
          )}

          <div className="leaderboards-page__pagination">
            <button
              type="button"
              onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
              disabled={isLoading || !pagination.hasPreviousPage}
            >
              Previous
            </button>
            <span>
              Page {pagination.page || page}
              {pagination.totalPages ? ` of ${pagination.totalPages}` : ""}
            </span>
            <button
              type="button"
              onClick={() => setPage((currentPage) => currentPage + 1)}
              disabled={isLoading || !pagination.hasNextPage}
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </ViewFrame>
  );
}

export default Leaderboards;
