import { Link, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { ChangePasswordModal } from "../../components";

export default function UserDropdown({ user, onLogout, onPasswordChanged }) {
    const [open, setOpen] = useState(false);
    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
    const ref = useRef();
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleChangePasswordClick = () => {
        setShowChangePasswordModal(true);
        setOpen(false); // Close dropdown when modal opens
    };

    const handlePasswordChanged = () => {
        if (onPasswordChanged) {
            onPasswordChanged();
        }
    };

    return (
        <div className="relative" ref={ref}>
            <button onClick={() => setOpen(!open)} className="flex items-center space-x-2 hover:bg-gray-50 px-3 py-2 rounded-lg cursor-pointer">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden cursor-pointer">
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
                <div className="absolute -right-6 mt-1 min-w-[200px] bg-white shadow-lg z-50 border border-gray-200 text-sm rounded-lg ">
                    <div className="rounded-lg hover:bg-gray-100 ">
                        <Link
                            to={`/profile/${user?._id}`}
                            className="text-center block px-4 py-2 text-[color:var(--color-base)] cursor-pointer"
                        >
                            Profile
                        </Link>
                        <div className="border-t border-gray-200 mx-10" />
                    </div>

                    <div className="hover:bg-gray-100">
                        <Link
                            to="/bookmarks"
                            className="text-center block px-4 py-2 text-[color:var(--color-base)] cursor-pointer"
                        >
                            Bookmarks
                        </Link>
                        <div className="border-t border-gray-200 mx-10" />
                    </div>

                    <div className="hover:bg-gray-100">
                        <Link
                            to="/likes"
                            className="text-center block px-4 py-2 text-[color:var(--color-base)] cursor-pointer"
                        >
                            Your Likes
                        </Link>
                        <div className="border-t border-gray-200 mx-10" />
                    </div>

                    <div className="hover:bg-gray-100">
                        <button
                            className="text-center w-full px-4 py-2 text-[color:var(--color-base)] cursor-pointer"
                            onClick={handleChangePasswordClick}
                        >
                            Change Password
                        </button>
                        <div className="border-t border-gray-200 mx-10" />
                    </div>

                    <div className="hover:bg-gray-100 rounded-b-lg">
                        <button
                            className="text-center w-full px-4 py-2 text-[color:var(--color-base)] cursor-pointer"
                            onClick={onLogout}
                        >
                            Logout
                        </button>

                    </div>
                </div>
            )}
            
            {/* Change Password Modal */}
            <ChangePasswordModal 
                isOpen={showChangePasswordModal} 
                onClose={() => setShowChangePasswordModal(false)} 
                onPasswordChanged={handlePasswordChanged}
            />
        </div>
    );
}
