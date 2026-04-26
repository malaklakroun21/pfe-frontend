import "./DashboardPage.css";

function DashboardPage({ title, subtitle, stats, cards, showHero = true }) {
  return (
    <div className={`dashboard-page ${showHero ? "" : "dashboard-page--compact"}`}>
      {showHero ? (
        <section className="dashboard-page__hero">
          <div>
            <p className="dashboard-page__hero-kicker">Internal app preview</p>
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>
          <div className="dashboard-page__hero-badge">Frontend only</div>
        </section>
      ) : null}

      <section className="dashboard-page__stats">
        {stats.map((stat) => (
          <article
            key={stat.label}
            className={`dashboard-page__stat dashboard-page__stat--${stat.accent}`}
          >
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
          </article>
        ))}
      </section>

      <section className="dashboard-page__panels">
        {cards.map((card) => (
          <article key={card.title} className="dashboard-page__panel">
            <h3>{card.title}</h3>
            <p>{card.text}</p>
          </article>
        ))}
      </section>
    </div>
  );
}

export default DashboardPage;
