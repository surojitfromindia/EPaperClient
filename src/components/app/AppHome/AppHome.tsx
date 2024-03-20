import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { AppURLPaths } from "@/constants/AppURLPaths.Constants.ts";
import { useEffect } from "react";

function AppHome() {
  // if path is just /home then we redirect to /home/dashboard
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (AppURLPaths.APP_PAGE.APP_HOME.INDEX === location.pathname) {
      navigate(AppURLPaths.APP_PAGE.APP_HOME.DASHBOARD);
    }
  }, [pathname, navigate]);

  return (
    <div>
      <Outlet />
    </div>
  );
}
export default AppHome;
