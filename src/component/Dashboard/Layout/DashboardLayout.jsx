import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar/Sidebar.jsx";
import {
  getDashboardSection,
  getDashboardSectionKeyFromPathname,
} from "../dashboardPages.js";
import "./DashboardLayout.css";

function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const activeItem = getDashboardSectionKeyFromPathname(location.pathname);

  const handleItemSelect = (itemKey) => {
    const targetSection = getDashboardSection(itemKey);
    navigate(targetSection.route);
  };

  return (
    <div className="dashboard-layout">
      <Sidebar activeItem={activeItem} onItemSelect={handleItemSelect} />

      <div className="dashboard-layout__workspace">
        <Outlet />
      </div>
    </div>
  );
}

export default DashboardLayout;
