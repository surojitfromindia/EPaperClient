import BrowserRouter from "@/BrowserRouter.tsx";
import {RouterProvider} from "react-router-dom";


const router = BrowserRouter;
function App() {
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;

