import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/app/SideBar.tsx";
import TopBar from "@/components/app/TopBar.tsx";
import { useCallback, useEffect, useState } from "react";
import {
  ApplicationState,
  AppState,
} from "@/API/Resources/v1/AppState/AppState.ts";
import LoaderFullPage from "@/components/app/common/LoaderFullPage.tsx";

export default function EPaper() {
  const [appState, setAppState] = useState<AppState>();
  const [applicationLoading, setApplicationLoading] = useState(true);

  // load app state.
  const loadApplicationState = useCallback(async (): Promise<boolean> => {
    await ApplicationState.build();
    setAppState(ApplicationState.getInstance().getAppState());
    return true;
  }, []);

  useEffect(() => {
    loadApplicationState()
      .then(() => {
        setApplicationLoading(false);
      })
      .catch((error) => console.log(error));
  }, [loadApplicationState]);

  // header, navbar and side components will stay here,
  // as those must appear all the time.
  return (
    <>
      {applicationLoading && <LoaderFullPage />}
      {!applicationLoading && (
        <div className={"block"}>
          <div
            className={
              "absolute top-0 bottom-0 left-0 right-0 flex flex-col overflow-hidden"
            }
          >
            <TopBar organization={appState?.organization} />
            <div className={"grid lg:grid-cols-5"}>
              <Sidebar className={"hidden lg:block"} />
              <div className={"col-span-3 lg:col-span-4"}>
                <div className={"h-screen p-5 overflow-scroll"}>
                  <Outlet />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
