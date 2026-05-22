import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar/Sidebar.jsx";
import {
  dashboardSectionKeys,
  getDashboardSection,
  getDashboardSectionKeyFromPathname,
} from "../dashboardPages.js";
import { getAuthUser } from "../../../authSession.js";
import "./DashboardLayout.css";

const ADMIN_HIDDEN_SECTIONS = new Set(["validation", "messages", "credits", "notifications"]);

function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const activeItem = getDashboardSectionKeyFromPathname(location.pathname);

  const user = getAuthUser();
  const isAdmin = String(user?.role || "").toLowerCase() === "admin";
  const visibleSectionKeys = isAdmin
    ? dashboardSectionKeys.filter((k) => !ADMIN_HIDDEN_SECTIONS.has(k))
    : dashboardSectionKeys;

  const handleItemSelect = (itemKey) => {
    const targetSection = getDashboardSection(itemKey);
    navigate(targetSection.route);
  };

  return (
    <div className="dashboard-layout">
      <Sidebar activeItem={activeItem} onItemSelect={handleItemSelect} sectionKeys={visibleSectionKeys} />

      <div className="dashboard-layout__workspace">
        <Outlet />
      </div>
    </div>
  );
}

export default DashboardLayout;
