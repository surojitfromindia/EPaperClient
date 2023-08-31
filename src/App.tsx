import LoginPage from "@/pages/public/LoginPage.tsx";
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import {default as PubicErrorPage} from "@/pages/public/ErrorPages/Page404.tsx";
import Page404 from "@/pages/private/ErrorPages/Page404.tsx";
import EPaper from "@/components/app/EPaper.tsx";
import Dashboard from "@/components/app/Dashboard/Dashboard.tsx";


function App() {
    const router = createBrowserRouter([
        {
            path: "/",
            element: <LoginPage/>,
            errorElement: <PubicErrorPage/>
        },
        {
            path: "app",
            element: <EPaper/>,
            errorElement: <Page404/>,
            children: [
                {
                    index:true,
                    path: "dashboard",
                    element: <Dashboard/>
                },
                {
                    path:"*",
                    element: <Page404/>,
                },
            ]
        }
    ])
    return (<>
        <RouterProvider router={router}/>
    </>)
}

export default App
