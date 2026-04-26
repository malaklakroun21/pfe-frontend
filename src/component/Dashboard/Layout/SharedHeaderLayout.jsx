import { Outlet, useLocation } from "react-router-dom";
import { getDashboardSection, getDashboardSectionKeyFromPathname } from "../dashboardPages.js";
import PageHeader from "./PageHeader/PageHeader.jsx";
import ViewFrame from "./ViewFrame/ViewFrame.jsx";

function SharedHeaderLayout() {
  const location = useLocation();
  const activeItem = getDashboardSectionKeyFromPathname(location.pathname);
  const currentSection = getDashboardSection(activeItem);

  return (
    <ViewFrame header={<PageHeader title={currentSection.headerTitle ?? currentSection.navLabel} />}>
      <Outlet />
    </ViewFrame>
  );
}

export default SharedHeaderLayout;
