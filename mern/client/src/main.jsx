// main.jsx or index.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext"; // Adjust path

import App from "./App.jsx";
import "./index.css";

import Home from "./pages/Home";
import Reports from "./pages/Reports";
import Claims from "./pages/Claims";
import About from "./pages/About";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Profile from "./pages/Profile";
import ReportDetail from "./pages/ReportDetail";
import ClaimDetail from "./pages/ClaimDetail";
import EditProfile from "./pages/EditProfile";
import Bookmarks from "./pages/Bookmarks";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: "home", element: <Home /> },
      { path: "reports", element: <Reports /> },
      { path: "reports/:id", element: <ReportDetail /> },
      { path: "claims", element: <Claims /> },
      { path: "claims/:id", element: <ClaimDetail /> },
      { path: "about", element: <About /> },
      { path: "login", element: <Login /> },
      { path: "signup", element: <SignUp /> },
      { path: "profile/:id", element: <Profile /> },
      { path: "editprofile", element: <EditProfile /> },
      { path: "bookmarks", element: <Bookmarks /> },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>
);