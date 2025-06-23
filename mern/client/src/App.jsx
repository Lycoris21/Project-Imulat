import { useEffect, useState } from 'react'
import { Outlet } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";

import './index.css'

function App() {
  // Simulate auth state
  const { user, isLoggedIn } = useAuth();

  return (
    <>
       <div className="app">
        <Navbar isLoggedIn={isLoggedIn} user={user} />
        <main>
          <Outlet />
        </main>
      </div>
    </>
  );
}

export default App;