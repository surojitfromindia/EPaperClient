import React, { Suspense } from "react";
import WelcomePage from "@/pages/public/WelcomePage.tsx";
import { createBrowserRouter } from "react-router-dom";
import { default as PubicErrorPage } from "@/pages/public/ErrorPages/Page404.tsx";
import Page404 from "@/pages/private/ErrorPages/Page404.tsx";
import EPaper from "@/components/app/EPaper.tsx";
import Dashboard from "@/components/app/Dashboard/Dashboard.tsx";
import InvoicePage from "@/components/app/Invoices/InvoicePage.tsx";
import LoaderComponent from "@/components/app/common/LoaderComponent.tsx";
import ItemPage from "@/components/app/Items/ItemPage.tsx";
import SignInForm from "@/pages/public/SignInForm.tsx";
import { AppURLPaths } from "@/constants/AppURLPaths.Constants.ts";
import HomePageWrapper from "@/pages/public/HomePageWrapper.tsx";
import FormPageWrapper from "@/pages/public/FormPageWrapper.tsx";
import ArrivingSoon from "@/components/app/common/ArrivingSoon.tsx";

const SignUpFormLazy = React.lazy(
  () => import("@/pages/public/SignUpForm.tsx"),
);
const CreateOrganizationLazy = React.lazy(
  () => import("@/pages/public/CreateOrganizationForm.tsx"),
);
// make InvoiceAdd lazy
const InvoiceAdd = React.lazy(
  () => import("@/components/app/Invoices/InvoiceAdd.tsx"),
);
const ChartOfAccountDetails = React.lazy(
  () => import("@/components/app/ChartOfAccount/ChartOfAccountDetails.tsx"),
);
const ChartOfAccountPage = React.lazy(
  () => import("@/components/app/ChartOfAccount/ChartOfAccountPage.tsx"),
);
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

const ContactDetails = React.lazy(
  () => import("@/components/app/Contacts/ContactDetails.tsx"),
);
const LazyWrapper = ({ children }: { children: React.ReactNode }) => {
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
const router = createBrowserRouter([
  {
    path: AppURLPaths.HOME,
    element: <HomePageWrapper />,
    errorElement: <PubicErrorPage />,
    children: [
      {
        path: AppURLPaths.HOME,
        element: <WelcomePage />,
        errorElement: <PubicErrorPage />,
      },
      {
        path: AppURLPaths.SIGN_IN,
        element: (
          <FormPageWrapper>
            <SignInForm />
          </FormPageWrapper>
        ),
        errorElement: <PubicErrorPage />,
      },
      {
        path: AppURLPaths.SIGN_UP,
        element: (
          <LazyWrapper>
            <FormPageWrapper>
              <SignUpFormLazy />
            </FormPageWrapper>
          </LazyWrapper>
        ),
        errorElement: <PubicErrorPage />,
      },
      {
        path: AppURLPaths.CREATE_ORGANIZATION,
        element: (
          <LazyWrapper>
            <FormPageWrapper>
              <CreateOrganizationLazy />
            </FormPageWrapper>
          </LazyWrapper>
        ),
        errorElement: <PubicErrorPage />,
      },
    ],
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
                    element: (
                      <div className={"px-5"}>
                        <ArrivingSoon />
                      </div>
                    ),
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
            children: [
              {
                path: ":contact_id_param",
                element: (
                  <LazyWrapper>
                    <ContactDetails />
                  </LazyWrapper>
                ),
                children: [
                  {
                    path: "comments",
                    element: (
                      <div className={"px-5"}>
                        <ArrivingSoon />
                      </div>
                    ),
                  },
                  {
                    path: "transactions",
                    element: (
                      <div className={"px-5"}>
                        <ArrivingSoon />
                      </div>
                    ),
                  },
                ],
              },
            ],
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

export default router;
