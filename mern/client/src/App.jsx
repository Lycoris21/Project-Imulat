import { useState } from 'react'
import { Outlet } from "react-router-dom";
import './App.css'

import Home from "./pages/Home";
import Navbar from "./components/Navbar";

function App() {
  const [count, setCount] = useState(0)
  const isLoggedIn = false; // Replace with actual auth state later

  return (
    <>
      <Navbar isLoggedIn={isLoggedIn} />
      <main className="p-6">
         <Outlet />
      </main>
    </>
  );
}

export default App
