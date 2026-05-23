import ViewFrame from "../Layout/ViewFrame/ViewFrame.jsx";
import MentorValidationInbox from "./MentorValidationInbox.jsx";
import PageHeader from "../Layout/PageHeader/PageHeader.jsx";

function MentorInbox() {
  return (
    <ViewFrame header={<PageHeader title="Mentor Inbox" />}>
      <section style={{ padding: "1.5rem" }}>
        <MentorValidationInbox />
      </section>
    </ViewFrame>
  );
}

export default MentorInbox;
