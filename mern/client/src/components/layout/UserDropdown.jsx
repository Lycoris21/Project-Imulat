import { Link, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect, useCallback } from "react";
import { ChangePasswordModal } from "../../components";

export default function UserDropdown({ user, onLogout, onPasswordChanged }) {
    const [open, setOpen] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
    const ref = useRef();
    const navigate = useNavigate();

    const handleToggle = () => {
        if (!open) {
            setOpen(true);
        } else {
            handleClose();
        }
    };

    const handleClose = () => {
        setIsAnimating(false);
        setTimeout(() => {
            setOpen(false);
        }, 150); // match animation duration
    };

    const handleClickOutside = useCallback((e) => {
        if (ref.current && !ref.current.contains(e.target)) {
            handleClose();
        }
    }, []);

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [handleClickOutside]);

    useEffect(() => {
        if (open) {
            setIsAnimating(true);
        }
    }, [open]);

    const handleChangePasswordClick = () => {
        setShowChangePasswordModal(true);
        handleClose();
    };

    const handleOptionClick = (to) => {
        navigate(to); // Navigate to the selected option
        handleClose(); // Close the dropdown
    };

    const handlePasswordChanged = () => {
        if (onPasswordChanged) {
            onPasswordChanged();
        }
    };

    return (
        <div className="relative" ref={ref}>
            <button onClick={handleToggle} className="flex items-center space-x-2 hover:bg-gray-50 px-3 py-2 rounded-lg cursor-pointer">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
                    {user.profilePictureUrl ? (
                        <img
                            src={user.profilePictureUrl}
                            alt={user.username}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <span className="text-gray-600 font-medium text-sm">
                            {user.username?.charAt(0).toUpperCase() || "U"}
                        </span>
                    )}
                </div>
                <span className="text-gray-700 font-medium">{user.username}</span>
            </button>

            {open && (
                <div
                    className={`absolute -right-6 mt-1 min-w-[200px] bg-white shadow-lg border border-gray-200 text-sm rounded-lg origin-top-right transform transition-all duration-150 z-50 ${
                        isAnimating ? "opacity-100 scale-100" : "opacity-0 scale-95"
                    }`}
                >
                    {[
                        { to: `/profile/${user?._id}`, label: "Profile" },
                        { to: "/bookmarks", label: "Bookmarks" },
                        { to: "/likes", label: "Your Likes" },
                        { to: "/activities", label: "Activity Log" },
                    ].map(({ to, label }, idx) => (
                        <div key={label} className={`hover:bg-gray-100 ${idx === 0 ? "rounded-t-lg" : ""}`}>
                            <button
                                onClick={() => handleOptionClick(to)}
                                className="block w-full px-4 py-2 text-center text-[color:var(--color-base)]"
                            >
                                {label}
                            </button>
                            <div className="border-t border-gray-200 mx-10" />
                        </div>
                    ))}

                    <div className="hover:bg-gray-100">
                        <button
                            onClick={handleChangePasswordClick}
                            className="w-full text-center px-4 py-2 text-[color:var(--color-base)]"
                        >
                            Change Password
                        </button>
                        <div className="border-t border-gray-200 mx-10" />
                    </div>

                    <div className="hover:bg-gray-100 rounded-b-lg">
                        <button
                            onClick={() => {
                                onLogout();
                                handleClose(); // Close the dropdown after logout
                            }}
                            className="w-full text-center px-4 py-2 text-[color:var(--color-base)]"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            )}

            <ChangePasswordModal
                isOpen={showChangePasswordModal}
                onClose={() => setShowChangePasswordModal(false)}
                onPasswordChanged={handlePasswordChanged}
            />
        </div>
    );
}
