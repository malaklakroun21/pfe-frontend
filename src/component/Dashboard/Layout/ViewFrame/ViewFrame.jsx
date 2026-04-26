import "./ViewFrame.css";

function ViewFrame({ header, children }) {
  return (
    <>
      {header ? <div className="dashboard-view-frame__header">{header}</div> : null}
      <div className="dashboard-view-frame__content">{children}</div>
    </>
  );
}

export default ViewFrame;
