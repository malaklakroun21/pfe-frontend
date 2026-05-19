import ViewFrame from "../Layout/ViewFrame/ViewFrame.jsx";
import Header from "../Layout/Header/Header.jsx";
import MySessionsPanel from "../Sessions/MySessionsPanel.jsx";

function MySessions() {
  return (
    <ViewFrame header={<Header />}>
      <MySessionsPanel />
    </ViewFrame>
  );
}

export default MySessions;
