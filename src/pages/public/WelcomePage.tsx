import { Link, Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button.tsx";
import { AppURLPaths } from "@/constants/AppURLPaths.Constants.ts";
import { LocalStorageAccess } from "@/util/LocalStorageAccess.ts";

export default function WelcomePage() {
  // todo: need to work on this
  const isSignedIn = LocalStorageAccess.getToken() !== null;
  return (
    <>
      <div className=" flex h-screen flex-col">
        <div className={"flex-grow grid bg-primary"}>
          <div className=" h-full flex-col p-10 text-white dark:border-r flex justify-between ">
            <div className=" flex justify-between text-lg font-medium">
              <div className={"flex items-center"}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2 h-6 w-6"
                >
                  <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
                </svg>
                EPaper Inc
              </div>
              <div><AccessAppButtons isisSignedIn={isSignedIn} /></div>
            </div>
            <div className="">
              <blockquote className="space-y-2">
                <p className="text-lg">
                  &ldquo;EPaper is an Invoicing software that is designed to
                  scale and adapt with various compliance.&rdquo;
                </p>
                <footer className="text-sm">Reducer</footer>
              </blockquote>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const AccessAppButtons = ({isisSignedIn}) => {
  return (
    <div className="flex flex-row space-x-2 items-center justify-center">
      { isisSignedIn &&
        <Button className={"uppercase text-xs "} asChild variant={"secondary"}>
          <Link to={AppURLPaths.APP_PAGE.DASHBOARD}>dashboard</Link>
        </Button>
      }
      { !isisSignedIn &&
        <Button className={"uppercase text-xs "} asChild variant={"secondary"}>
          <Link to={AppURLPaths.SIGN_IN}>Sign In</Link>
        </Button>
      }
      <Button className={"uppercase text-xs"} asChild variant={"secondary"}>
        <Link to={AppURLPaths.SIGN_UP}>New Account</Link>
      </Button>
    </div>
  );
};
