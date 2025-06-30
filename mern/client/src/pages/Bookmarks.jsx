import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSearchSuggestions } from "../hooks/useSearchSuggestions";

// Components
import { LoadingScreen, ErrorScreen, SearchBar } from '../components';
import CollectionCard from '../components/bookmarks/CollectionCard';
import CreateCollectionModal from '../components/bookmarks/CreateCollectionModal';

export default function Bookmarks() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingCollection, setEditingCollection] = useState(null);
    
    // Search functionality with suggestions
    const {
        query: searchQuery,
        updateQuery: setSearchQuery,
        suggestions,
        isLoading: suggestionsLoading
    } = useSearchSuggestions();

    // Redirect if not logged in
    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    // Fetch collections
    const fetchCollections = async () => {
        if (!user?._id) return;

        try {
            setLoading(true);
            const response = await fetch(`http://localhost:5050/api/bookmarks/collections/${user._id}`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch collections');
            }
            
            const data = await response.json();
            setCollections(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching collections:', err);
            setError('Failed to load collections');
        } finally {
            setLoading(false);
        }
    };

    // Create collection
    const handleCreateCollection = async (collectionData) => {
        try {
            const response = await fetch('http://localhost:5050/api/bookmarks/collections', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: user._id,
                    collectionName: collectionData.name,
                    collectionBanner: collectionData.bannerUrl,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create collection');
            }

            await fetchCollections();
        } catch (error) {
            throw error;
        }
    };

    // Update collection
    const handleUpdateCollection = async (collectionData) => {
        try {
            const response = await fetch(`http://localhost:5050/api/bookmarks/collections/${editingCollection._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: user._id,
                    collectionName: collectionData.name,
                    collectionBanner: collectionData.bannerUrl,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update collection');
            }

            await fetchCollections();
        } catch (error) {
            throw error;
        }
    };

    // Delete collection
    const handleDeleteCollection = async (collection) => {
        if (!window.confirm(`Are you sure you want to delete "${collection.collectionName}"? This will move all bookmarks in this collection to "All Bookmarks".`)) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:5050/api/bookmarks/collections/${collection._id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId: user._id }),
            });

            if (!response.ok) {
                throw new Error('Failed to delete collection');
            }

            await fetchCollections();
        } catch (error) {
            console.error('Error deleting collection:', error);
            alert('Failed to delete collection');
        }
    };

    // Handle search
    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/bookmarks/search?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    useEffect(() => {
        if (user?._id) {
            fetchCollections();
        }
    }, [user?._id]);

    if (!user) {
        return null; // Will redirect in useEffect
    }

    if (loading) {
        return <LoadingScreen message="Loading your bookmarks..." />;
    }

    if (error) {
        return (
            <ErrorScreen 
                title="Error Loading Bookmarks" 
                message={error}
                onRetry={fetchCollections}
            />
        );
    }

    return (
        <div className="min-h-[calc(100vh-5rem)] bg-base-gradient py-8">
            <div className="max-w-6xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-4 text-center">My Bookmarks</h1>
                    
                    {/* Search Bar */}
                    <SearchBar 
                        value={searchQuery}
                        onChange={handleSearchChange}
                        onSubmit={handleSearch}
                        placeholder="Search bookmarks and collections..."
                        showDropdown={true}
                        suggestions={suggestions}
                        isLoading={suggestionsLoading}
                    />
                </div>

                {/* Quick Actions */}
                <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {/* All Bookmarks Card */}
                    <Link
                        to="/bookmarks/all"
                        className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow group"
                    >
                        <div className="flex items-center mb-3">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-900 group-hover:text-green-600 transition-colors">
                                    All Bookmarks
                                </h3>
                                <p className="text-sm text-gray-500">
                                    View all your saved items
                                </p>
                            </div>
                        </div>
                    </Link>

                    {/* Create Collection Card */}
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-white rounded-lg p-6 hover:border-blue-400 hover:bg-blue-50 transition-colors text-left group"
                    >
                        <div className="flex items-center mb-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                                    New Collection
                                </h3>
                                <p className="text-sm text-gray-500">
                                    Create a new folder
                                </p>
                            </div>
                        </div>
                    </button>
                </div>

                {/* Collections */}
                {collections.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-100 mb-4">
                            My Collections ({collections.length})
                        </h2>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {collections.map((collection) => (
                                <CollectionCard
                                    key={collection._id}
                                    collection={collection}
                                    onEdit={(collection) => {
                                        setEditingCollection(collection);
                                        setShowCreateModal(true);
                                    }}
                                    onDelete={handleDeleteCollection}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {collections.length === 0 && (
                    <div className="text-center py-12">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-200 mb-2">No collections yet</h3>
                        <p className="text-gray-500 mb-6">
                            Create collections to organize your bookmarks into folders
                        </p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="inline-flex items-center px-4 py-2 bg-[color:var(--color-base)] text-white rounded-lg hover:bg-[color:var(--color-selected)] transition-colors"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Create Your First Collection
                        </button>
                    </div>
                )}
            </div>

            {/* Create/Edit Collection Modal */}
            <CreateCollectionModal
                isOpen={showCreateModal}
                onClose={() => {
                    setShowCreateModal(false);
                    setEditingCollection(null);
                }}
                onCreate={editingCollection ? handleUpdateCollection : handleCreateCollection}
                collection={editingCollection}
            />
        </div>
    );
}