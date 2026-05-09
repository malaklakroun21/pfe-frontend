import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../Dashboard/Layout/Sidebar/Sidebar.jsx";
import {
  getAdminSection,
  getAdminSectionKeyFromPathname,
  adminSectionKeys,
  adminSections,
} from "./adminPages.js";
import "../Dashboard/Layout/DashboardLayout.css";

function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const activeItem = getAdminSectionKeyFromPathname(location.pathname);

  const handleItemSelect = (itemKey) => {
    const targetSection = getAdminSection(itemKey);
    navigate(targetSection.route);
  };

  return (
    <div className="dashboard-layout">
      <Sidebar
        activeItem={activeItem}
        onItemSelect={handleItemSelect}
        sectionKeys={adminSectionKeys}
        sections={adminSections}
        brandTo="/admin"
        brandLabel="Go to admin dashboard"
      />

      <div className="dashboard-layout__workspace">
        <Outlet />
      </div>
    </div>
  );
}

export default AdminLayout;

