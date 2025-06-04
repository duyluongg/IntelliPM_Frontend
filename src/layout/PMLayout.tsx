import { Outlet } from "react-router-dom";
import SidebarPM from "../components/PM/sildebarPM";

const PMLayout = () => (
  <div className="flex h-screen">
    <SidebarPM />
    <div className="flex-1 overflow-auto">
      <Outlet />
    </div>
  </div>
);

export default PMLayout;