import React, { Suspense } from "react";
import LoginPage from "@/pages/public/LoginPage.tsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { default as PubicErrorPage } from "@/pages/public/ErrorPages/Page404.tsx";
import Page404 from "@/pages/private/ErrorPages/Page404.tsx";
import EPaper from "@/components/app/EPaper.tsx";
import Dashboard from "@/components/app/Dashboard/Dashboard.tsx";
import InvoicePage from "@/components/app/Invoices/InvoicePage.tsx";
import LoaderComponent from "@/components/app/common/LoaderComponent.tsx";
import ItemPage from "@/components/app/Items/ItemPage.tsx";
import ContactAdd from "@/components/app/Contacts/ContactAdd.tsx";
// make InvoiceAdd lazy
const InvoiceAdd = React.lazy(
  () => import("@/components/app/Invoices/InvoiceAdd.tsx"),
);

//make ChartOfAccountDetails & ChartOfAccountPage lazy
const ChartOfAccountDetails = React.lazy(
  () => import("@/components/app/ChartOfAccount/ChartOfAccountDetails.tsx"),
);
const ChartOfAccountPage = React.lazy(
  () => import("@/components/app/ChartOfAccount/ChartOfAccountPage.tsx"),
);
// make ItemAdd & ItemDetails lazy
const ItemAdd = React.lazy(() => import("@/components/app/Items/ItemAdd.tsx"));
const ItemDetails = React.lazy(
  () => import("@/components/app/Items/ItemDetails.tsx"),
);

const ContactPage = React.lazy(
  () => import("@/components/app/Contacts/ContactPage.tsx"),
);
const CustomerAddWrapper = React.lazy(
  () => import("@/components/app/Contacts/CustomerAddWrapper.tsx"),
);

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <LoginPage />,
      errorElement: <PubicErrorPage />,
    },
    {
      path: "/404",
      element: <PubicErrorPage />,
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
              element: (
                <LazyWrapper>
                  <ItemAdd />
                </LazyWrapper>
              ),
            },
            {
              path: "items/:item_id_param/edit",
              element: (
                <LazyWrapper>
                  <ItemAdd />
                </LazyWrapper>
              ),
            },
            {
              path: "items",
              element: <ItemPage />,
              children: [
                {
                  path: ":item_id_param",
                  element: (
                    <LazyWrapper>
                      <ItemDetails />
                    </LazyWrapper>
                  ),
                  children: [
                    {
                      path: "transactions",
                      element: <div className={"px-5"}>all transactions</div>,
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          path: "chart_of_accounts",
          element: (
            <LazyWrapper>
              <ChartOfAccountPage />
            </LazyWrapper>
          ),
          errorElement: <Page404 />,
          children: [
            {
              path: ":account_id",
              element: (
                <LazyWrapper>
                  <ChartOfAccountDetails />
                </LazyWrapper>
              ),
            },
          ],
        },
        {
          path: "invoices",
          errorElement: <Page404 />,
          children: [
            {
              path: "",
              element: (
                <LazyWrapper>
                  <InvoicePage />
                </LazyWrapper>
              ),
            },
            {
              path: "new",
              element: (
                <LazyWrapper>
                  <InvoiceAdd />
                </LazyWrapper>
              ),
            },
            {
              path: ":invoice_id_param/edit",
              element: (
                <LazyWrapper>
                  <InvoiceAdd />
                </LazyWrapper>
              ),
            },
          ],
        },
        {
          path: "customers",
          errorElement: <Page404 />,
          children: [
            {
              path: "",
              element: (
                <LazyWrapper>
                  <ContactPage />
                </LazyWrapper>
              ),
            },
            {
              path: "new",
              element: (
                <LazyWrapper>
                  <CustomerAddWrapper />
                </LazyWrapper>
              ),
            },
            {
              path: ":contact_id_param/edit",
              element: (
                  <LazyWrapper>
                    <CustomerAddWrapper />
                  </LazyWrapper>
              ),
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

const LazyWrapper = ({ children }:{
    children: React.ReactNode
}) => {
  return (
    <Suspense
      fallback={
        <div className={"relative"}>
          <LoaderComponent />
        </div>
      }
    >
      {children}
    </Suspense>
  );
};
