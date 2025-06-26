import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // assumes auth context is available

// Components
import { LoadingScreen, ErrorScreen } from '../components';

export default function Bookmarks() {
    return(
    <div className="min-h-screen bg-base-gradient py-8"></div>
    );
}