import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/app/SideBar.tsx";
import TopBar from "@/components/app/TopBar.tsx";
import { useEffect, useState } from "react";
import {
  applicationState,
  AppState,
} from "@/API/Resources/v1/AppState/AppState.ts";
import LoaderFullPage from "@/components/app/common/LoaderFullPage.tsx";

export default function EPaper() {
  const [, setAppState] = useState<AppState>();
  const [applicationLoading, setApplicationLoading] = useState(true);

  useEffect(() => {
    setAppState(applicationState.getAppState());
    setApplicationLoading(false);
  }, []);

  // header, navbar and side components will stay here,
  // as those must appear all the time.
  return (
    <>
      {applicationLoading && <LoaderFullPage />}
      <div className={"block"}>
        <div
          className={
            "absolute top-0 bottom-0 left-0 right-0 flex flex-col overflow-hidden"
          }
        >
          <TopBar />
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
    </>
  );
}
