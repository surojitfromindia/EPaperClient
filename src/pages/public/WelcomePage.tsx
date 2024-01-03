import { Outlet } from "react-router-dom";

export default function WelcomePage() {
  return (
    <>
      <div className=" flex h-screen flex-col">
        <div
          className={
            "flex-grow relative container  items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0"
          }
        >
          <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
            <div className="absolute inset-0 bg-primary" />
            <div className="relative z-20 flex items-center text-lg font-medium">
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
            <div className="relative z-20 mt-auto">
              <blockquote className="space-y-2">
                <p className="text-lg">
                  &ldquo;EPaper is an Invoicing software that is designed to
                  scale and adapt with various compliance.&rdquo;
                </p>
                <footer className="text-sm">Reducer</footer>
              </blockquote>
            </div>
          </div>
          <div className="lg:p-8">
            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
}
