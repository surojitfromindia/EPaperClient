import LoginPage from "@/pages/public/LoginPage.tsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { default as PubicErrorPage } from "@/pages/public/ErrorPages/Page404.tsx";
import Page404 from "@/pages/private/ErrorPages/Page404.tsx";
import EPaper from "@/components/app/EPaper.tsx";
import Dashboard from "@/components/app/Dashboard/Dashboard.tsx";
import ChartOfAccountPage from "@/components/app/ChartOfAccount/ChartOfAccountPage.tsx";
import ChartOfAccountDetails from "@/components/app/ChartOfAccount/ChartOfAccountDetails.tsx";
import { ItemPage } from "@/components/app/Items/ItemPage.tsx";
import ItemAdd from "@/components/app/Items/ItemAdd.tsx";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <LoginPage />,
      errorElement: <PubicErrorPage />,
    },
    {
      path: "app",
      element: <EPaper />,
      errorElement: <Page404 />,
      children: [
        {
          path: "",
          element: <Dashboard />,
          errorElement: <Page404 />,
        },
        {
          index: true,
          path: "dashboard",
          element: <Dashboard />,
          errorElement: <Page404 />,
        },
        {
          path: "inventory",
          errorElement: <Page404 />,
          children: [
            {
              path: "items/new",
              element: <ItemAdd />,
            },
            {
              path: "items/:item_id/edit",
              element: <ItemAdd />,
            },
            {
              path: "items",
              element: <ItemPage />,
              children: [
                {
                  path: ":item_id",
                  element: <div>Details</div>,
                },
              ],
            },
          ],
        },
        {
          path: "chart_of_accounts",
          element: <ChartOfAccountPage />,
          errorElement: <Page404 />,
          children: [
            {
              path: ":account_id",
              element: <ChartOfAccountDetails />,
            },
          ],
        },
        {
          path: "*",
          element: <Page404 />,
        },
      ],
    },
  ]);
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
