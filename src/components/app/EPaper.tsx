import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/app/SideBar.tsx";
import TopBar from "@/components/app/TopBar.tsx";
import { useCallback, useEffect, useState } from "react";
import {
  ApplicationState,
  AppState,
} from "@/API/Resources/v1/AppState/AppState.ts";
import LoaderFullPage from "@/components/app/common/LoaderFullPage.tsx";
import { Toaster } from "@/components/ui/toaster.tsx";
import { Provider } from "react-redux";
import store from "@/redux/store.ts";
import { Button } from "@/components/ui/button.tsx";
import { MenuIcon } from "lucide-react";
import { AppURLPaths } from "@/constants/AppURLPaths.Constants.ts";
import { LocalStorageAccess } from "@/util/LocalStorageAccess.ts";

export default function EPaper() {
  const navigate = useNavigate();
  const [applicationLoading, setApplicationLoading] = useState(true);
  const [openSideDrawer, setOpenSideDrawer] = useState(false);
  const { pathname } = useLocation();
  // load app state.
  // note: this is the primary function that will be called
  const loadApplicationState = useCallback(async (): Promise<boolean> => {
    await ApplicationState.build().catch((error) => {
      setApplicationLoading(false);
      LocalStorageAccess.removeAccessInfo();
      navigate(AppURLPaths.SIGN_IN);
    });
    setApplicationLoading(false);
    return true;
  }, [navigate]);

  useEffect(() => {
    loadApplicationState().catch(() => false);
  }, [loadApplicationState, navigate]);

  // header, navbar and side components will stay here,
  // as those must appear all the time.
  useEffect(() => {
    setOpenSideDrawer(false);
  }, [pathname]);
  return (
    <>
      <Provider store={store}>
        {applicationLoading && <LoaderFullPage />}
        {!applicationLoading && (
            <main
              className={
                "top-0 bottom-0 left-0 right-0 flex flex-col overflow-hidden h-screen"
              }
            >
              <TopBar />
              <div className={"flex grow  relative"}>
                <Sidebar sideBarFloat={openSideDrawer} />
                <section className={"w-full h-screen"}>
                  <Outlet />
                  <Toaster />
                </section>
                <Button
                  onClick={() => {
                    setOpenSideDrawer((prev) => !prev);
                  }}
                  size={"icon"}
                  className={"sm:hidden p-3 rounded-3xl fixed right-5 bottom-5"}
                >
                  <MenuIcon />
                </Button>
              </div>
            </main>
        )}
      </Provider>
    </>
  );
}
