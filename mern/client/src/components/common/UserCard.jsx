import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaThumbsUp, FaThumbsDown, FaUser } from 'react-icons/fa';

export default function UserCard({ user, variant = 'default' }) {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/profile/${user._id}`);
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'admin':
                return 'text-pink-600 bg-pink-100';
            case 'researcher':
                return 'text-purple-600 bg-purple-100';
            case 'user':
            default:
                return 'text-blue-600 bg-blue-100';
        }
    };

    const getRoleLabel = (role) => {
        switch (role) {
            case 'admin':
                return 'Admin';
            case 'researcher':
                return 'Researcher';
            case 'user':
            default:
                return 'User';
        }
    };

    if (variant === 'compact') {
        return (
            <div
                className="bg-white rounded-xl p-4 shadow hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer border border-gray-100 hover:bg-[color:var(--color-background-hover)] group"
                onClick={handleClick}
            >
                <div className="relative">
                    {/* Role badge in upper right corner */}
                    <span className={`absolute top-0 right-0 text-xs px-2 py-1 rounded-full font-medium ${getRoleColor(user.role)}`}>
                        {getRoleLabel(user.role)}
                    </span>
                    
                    {/* Likes and dislikes aligned with bio */}
                    <div className="absolute bottom-0 right-0 flex items-center space-x-2 text-xs text-gray-500">
                        <span className="flex items-center">
                            <FaThumbsUp className="mr-1" />
                            {user.likes || 0}
                        </span>
                        <span className="flex items-center">
                            <FaThumbsDown className="mr-1" />
                            {user.dislikes || 0}
                        </span>
                    </div>
                    
                    <div className="flex items-center space-x-3 pr-12">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                            {user.profilePictureUrl ? (
                                <img
                                    src={user.profilePictureUrl}
                                    alt={user.username}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <FaUser className="text-gray-600 text-lg" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0 relative">
                            <h3 className="font-semibold text-[color:var(--color-dark)] truncate group-hover:text-[color:var(--color-selected)] transition-colors">
                                {user.username}
                            </h3>
                            <p className="text-gray-600 text-xs line-clamp-2 pr-12">
                                {user.bio || "This user has not set a bio yet."}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Default variant with more details
    return (
        <div
            className="bg-white rounded-xl p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer border border-gray-100 hover:bg-[color:var(--color-background-hover)] group"
            onClick={handleClick}
        >
            <div className="relative">
                {/* Role badge in upper right corner */}
                <span className={`absolute top-0 right-0 text-sm px-3 py-1 rounded-full font-medium ${getRoleColor(user.role)}`}>
                    {getRoleLabel(user.role)}
                </span>
                
                {/* Likes and dislikes aligned with bio */}
                <div className="absolute bottom-0 right-0 flex items-center space-x-4">
                    <div className="flex items-center space-x-1 text-green-600">
                        <FaThumbsUp className="text-sm" />
                        <span className="text-sm font-medium">{user.likes || 0}</span>
                        <span className="text-xs text-gray-500">likes</span>
                    </div>
                    <div className="flex items-center space-x-1 text-red-600">
                        <FaThumbsDown className="text-sm" />
                        <span className="text-sm font-medium">{user.dislikes || 0}</span>
                        <span className="text-xs text-gray-500">dislikes</span>
                    </div>
                </div>
                
                <div className="flex items-start space-x-4 pr-20">
                    {/* Profile Picture */}
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                        {user.profilePictureUrl ? (
                            <img
                                src={user.profilePictureUrl}
                                alt={user.username}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <FaUser className="text-gray-600 text-xl" />
                        )}
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0 relative">
                        {/* Header with username */}
                        <div className="mb-2">
                            <h3 className="text-lg font-bold text-[color:var(--color-dark)] truncate group-hover:text-[color:var(--color-selected)] transition-colors">
                                {user.username}
                            </h3>
                        </div>

                        {/* Bio */}
                        <p className="text-gray-600 text-sm line-clamp-2 pr-20">
                            {user.bio || "This user has not set a bio yet."}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
