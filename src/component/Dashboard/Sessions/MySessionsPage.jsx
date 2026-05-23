import ViewFrame from "../Layout/ViewFrame/ViewFrame.jsx";
import PageHeader from "../Layout/PageHeader/PageHeader.jsx";
import MySessionsPanel from "./MySessionsPanel.jsx";

function MySessionsPage() {
  return (
    <ViewFrame header={<PageHeader title="My Sessions" />}>
      <MySessionsPanel />
    </ViewFrame>
  );
}

export default MySessionsPage;
