import { useState } from 'react'
import { Outlet } from "react-router-dom";
import './App.css'

import Home from "./pages/Home";
import Navbar from "./components/Navbar";

function App() {
  const [count, setCount] = useState(0)
  const isLoggedIn = false; // Replace with actual auth state later
  
  // Mock user data - replace with actual user data from auth context
  const user = isLoggedIn ? {
    username: "john_doe",
    profilePicture: null // or URL to profile picture
  } : null;

  return (
    <div className="app">
      <Navbar isLoggedIn={isLoggedIn} user={user} />
      <main>
         <Outlet />
      </main>
    </div>
  );
}

export default App
