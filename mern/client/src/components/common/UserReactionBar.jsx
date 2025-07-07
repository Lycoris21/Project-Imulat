import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { LoginRequiredModal } from "../index";

export default function UserReactionBar({ targetUserId, initialLikes = 0, initialDislikes = 0, onReactionUpdate }) {
    const { user } = useAuth();
    const [likes, setLikes] = useState(initialLikes);
    const [dislikes, setDislikes] = useState(initialDislikes);
    const [userReaction, setUserReaction] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);

    // Fetch user's current reaction on component mount
    useEffect(() => {
        if (user && targetUserId && user._id !== targetUserId) {
            fetchUserReaction();
        }
    }, [user, targetUserId]);

    const fetchUserReaction = async () => {
        try {
            const response = await fetch(
                `http://localhost:5050/api/reactions/user/user/${targetUserId}/${user._id}`
            );
            if (response.ok) {
                const reaction = await response.json();
                setUserReaction(reaction?.reactionType || null);
            }
        } catch (error) {
            console.error("Error fetching user reaction:", error);
        }
    };

    const handleReaction = async (reactionType) => {
        // Show login modal if user is not logged in
        if (!user) {
            setShowLoginModal(true);
            return;
        }
        
        if (loading || user._id === targetUserId) return;

        setLoading(true);
        try {
            const response = await fetch("http://localhost:5050/api/reactions/toggle", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userId: user._id,
                    targetId: targetUserId,
                    targetType: "user",
                    reactionType: reactionType,
                }),
            });

            if (response.ok) {
                // Update local state based on previous reaction
                let newLikes = likes;
                let newDislikes = dislikes;
                
                if (userReaction === reactionType) {
                    // Remove reaction
                    setUserReaction(null);
                    if (reactionType === "like") {
                        newLikes = Math.max(0, likes - 1);
                        setLikes(newLikes);
                    } else {
                        newDislikes = Math.max(0, dislikes - 1);
                        setDislikes(newDislikes);
                    }
                } else {
                    // Set new reaction
                    const prevReaction = userReaction;
                    setUserReaction(reactionType);
                    
                    if (reactionType === "like") {
                        newLikes = likes + 1;
                        setLikes(newLikes);
                        if (prevReaction === "dislike") {
                            newDislikes = Math.max(0, dislikes - 1);
                            setDislikes(newDislikes);
                        }
                    } else {
                        newDislikes = dislikes + 1;
                        setDislikes(newDislikes);
                        if (prevReaction === "like") {
                            newLikes = Math.max(0, likes - 1);
                            setLikes(newLikes);
                        }
                    }
                }
                
                // Notify parent component of the update
                if (onReactionUpdate) {
                    onReactionUpdate(newLikes, newDislikes);
                }
            }
        } catch (error) {
            console.error("Error updating reaction:", error);
        } finally {
            setLoading(false);
        }
    };

    // Show reaction bar for all users, but handle login requirement in the click handler
    // Don't show if viewing own profile
    if (user && user._id === targetUserId) {
        return null;
    }

    return (
        <>
            <div className="flex items-center space-x-1 md:space-x-2">
                <button
                    onClick={() => handleReaction('like')}
                    disabled={loading}
                    className={`flex items-center space-x-1 md:space-x-2 px-2 py-1 md:px-3 md:py-2 rounded-lg transition ${
                        userReaction === 'like'
                            ? 'bg-green-100 text-green-600'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 cursor-pointer'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                    </svg>
                    <span className="hidden md:inline">{userReaction === 'like' ? 'Liked' : 'Like'}</span>
                    <span className="md:hidden text-xs">{likes}</span>
                </button>
                <button
                    onClick={() => handleReaction('dislike')}
                    disabled={loading}
                    className={`flex items-center space-x-1 md:space-x-2 px-2 py-1 md:px-3 md:py-2 rounded-lg transition ${
                        userReaction === 'dislike'
                            ? 'bg-red-100 text-red-600'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 cursor-pointer'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 20 20" transform="rotate(180)">
                        <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                    </svg>
                    <span className="hidden md:inline">{userReaction === 'dislike' ? 'Disliked' : 'Dislike'}</span>
                    <span className="md:hidden text-xs">{dislikes}</span>
                </button>
            </div>
            
            <LoginRequiredModal 
                isOpen={showLoginModal}
                onClose={() => setShowLoginModal(false)}
                action="like or dislike profiles"
            />
        </>
    );
}
