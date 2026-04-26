import './Leaders.css';

function Leaders() {
  const leaders = [
    { name: 'Maissa Slimani', role: 'UI/UX Design', level: 'Level 45' },
    { name: 'Djamel Reghoubi', role: 'React Development', level: 'Level 53' },
    { name: 'Lydia Mehani', role: 'Spanish Tutor', level: 'Level 41' },
    { name: 'Adem Berkan', role: 'Digital Marketing', level: 'Level 66' }
  ];

  return (
    <section className="leaders" id="leaders">
        <h2>Meet Our Community Leaders</h2>
        <p>Real People Sharing Real Skills And Building Meaningful Connections</p>
        <div className="leaders-grid">
            {leaders.map((leader, index) => (
                <div key={index} className="leader-item">
                    <div className="leader-avatar"></div>
                    <h3>{leader.name}</h3>
                    <p className="leader-role">{leader.role}</p>
                    <p className="leader-level">{leader.level}</p>
                </div>
            ))}
        </div>
    </section>
  );
}

export default Leaders;
