import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function BookmarkModal({ 
  isOpen, 
  onClose, 
  onSave, 
  itemId, 
  itemType, // "Report" or "Claim"
  itemTitle 
}) {
  const { user } = useAuth();
  const [collections, setCollections] = useState([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState('');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionBanner, setNewCollectionBanner] = useState('');
  const [newCollectionBannerFile, setNewCollectionBannerFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const fileInputRef = useRef(null);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setSelectedCollectionId('');
      setIsCreatingNew(false);
      setNewCollectionName('');
      setNewCollectionBanner('');
      setNewCollectionBannerFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setError('');
      onClose();
    }, 150); // Wait for animation to complete
  };

  // Handle animation states
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    } else {
      setIsAnimating(false);
    }
  }, [isOpen]);

  // Fetch collections when modal opens
  useEffect(() => {
    if (isOpen && user?._id) {
      fetchCollections();
    }
  }, [isOpen, user?._id]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      return () => {
        document.removeEventListener('keydown', handleEscKey);
      };
    }
  }, [isOpen]);

  const fetchCollections = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5050/api/bookmarks/collections/${user._id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch collections');
      }
      
      const data = await response.json();
      setCollections(data);
    } catch (err) {
      console.error('Error fetching collections:', err);
      setError('Failed to load collections');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');

      let collectionId = selectedCollectionId;

      // Create new collection if needed
      if (isCreatingNew && newCollectionName.trim()) {
        let finalBannerUrl = newCollectionBanner;

        // Upload banner file if selected
        if (newCollectionBannerFile) {
          const formData = new FormData();
          formData.append("image", newCollectionBannerFile);
          const uploadResponse = await fetch('http://localhost:5050/api/uploads/cover-photo', {
            method: "POST",
            body: formData
          });
          const uploadData = await uploadResponse.json();
          if (!uploadResponse.ok) throw new Error(uploadData.message || "Banner upload failed");
          finalBannerUrl = uploadData.url;
        }

        const createResponse = await fetch('http://localhost:5050/api/bookmarks/collections', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user._id,
            collectionName: newCollectionName.trim(),
            collectionBanner: finalBannerUrl || null,
          }),
        });

        if (!createResponse.ok) {
          const errorData = await createResponse.json();
          throw new Error(errorData.error || 'Failed to create collection');
        }

        const newCollection = await createResponse.json();
        collectionId = newCollection._id;
      }

      // Save bookmark
      await onSave({
        itemId,
        itemType,
        collectionId: collectionId || null, // null means no collection (save to "All Bookmarks")
      });

      handleClose();
    } catch (err) {
      console.error('Error saving bookmark:', err);
      setError(err.message || 'Failed to save bookmark');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 bg-[#00000080] flex items-center justify-center z-50 p-4 transition-opacity duration-150 ${
      isAnimating ? 'opacity-100' : 'opacity-0'
    }`}>
      <div className={`bg-white rounded-lg max-w-md w-full max-h-[90vh] flex flex-col transform transition-all duration-150 ${
        isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
      }`}>
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Save to Collection
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Choose where to save "{itemTitle || 'this item'}"
          </p>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* No Collection Option */}
              <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="collection"
                  value=""
                  checked={!selectedCollectionId && !isCreatingNew}
                  onChange={() => {
                    setSelectedCollectionId('');
                    setIsCreatingNew(false);
                  }}
                  className="mr-3 text-blue-600"
                />
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">All Bookmarks</span>
                    <p className="text-sm text-gray-500">Save without a collection</p>
                  </div>
                </div>
              </label>

              {/* Existing Collections */}
              {collections.map((collection) => (
                <label 
                  key={collection._id}
                  className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="collection"
                    value={collection._id}
                    checked={selectedCollectionId === collection._id}
                    onChange={() => {
                      setSelectedCollectionId(collection._id);
                      setIsCreatingNew(false);
                    }}
                    className="mr-3 text-blue-600"
                  />
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      {collection.collectionBanner ? (
                        <img 
                          src={collection.collectionBanner} 
                          alt=""
                          className="w-8 h-8 object-cover rounded-lg"
                        />
                      ) : (
                        <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">{collection.collectionName}</span>
                      <p className="text-sm text-gray-500">
                        {collection.bookmarkCount} {collection.bookmarkCount === 1 ? 'bookmark' : 'bookmarks'}
                      </p>
                    </div>
                  </div>
                </label>
              ))}

              {/* Create New Collection Option */}
              <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="collection"
                  value="new"
                  checked={isCreatingNew}
                  onChange={() => {
                    setIsCreatingNew(true);
                    setSelectedCollectionId('');
                  }}
                  className="mr-3 text-blue-600"
                />
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">Create New Collection</span>
                    <p className="text-sm text-gray-500">Make a new folder</p>
                  </div>
                </div>
              </label>

              {/* New Collection Form */}
              {isCreatingNew && (
                <div className="ml-11 space-y-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Collection Name
                    </label>
                    <input
                      type="text"
                      value={newCollectionName}
                      onChange={(e) => setNewCollectionName(e.target.value)}
                      placeholder="Enter collection name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      autoFocus
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Banner Image (Optional)
                    </label>
                    
                    {/* File Upload Option */}
                    <div className="mb-3">
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Upload Image File
                      </label>
                      <div className="relative">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            setNewCollectionBannerFile(e.target.files[0]);
                            if (e.target.files[0]) {
                              setNewCollectionBanner(''); // Clear URL when file is selected
                            }
                          }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          disabled={loading}
                        />
                        <div className="w-full px-3 py-2 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 bg-white flex items-center">
                          <span className="text-gray-900">Choose File</span>
                          <span className="mx-2 text-gray-400">|</span>
                          <span className={`${newCollectionBannerFile ? 'text-gray-600' : 'text-gray-400'} flex-1 truncate text-left`}>
                            {newCollectionBannerFile ? newCollectionBannerFile.name : 'No file chosen'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* URL Input Option */}
                    <div className="mb-3">
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Or Enter Image URL
                      </label>
                      <input
                        type="url"
                        value={newCollectionBanner}
                        onChange={(e) => {
                          setNewCollectionBanner(e.target.value);
                          if (e.target.value.trim()) {
                            setNewCollectionBannerFile(null); // Clear file when URL is entered
                            if (fileInputRef.current) {
                              fileInputRef.current.value = '';
                            }
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="https://example.com/image.jpg"
                        disabled={loading}
                      />
                    </div>

                    {/* Preview */}
                    {(newCollectionBanner || newCollectionBannerFile) && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-gray-600">Preview:</p>
                          <button
                            type="button"
                            onClick={() => {
                              setNewCollectionBanner('');
                              setNewCollectionBannerFile(null);
                              if (fileInputRef.current) {
                                fileInputRef.current.value = '';
                              }
                            }}
                            className="text-xs text-red-600 hover:text-red-800 transition-colors"
                            disabled={loading}
                          >
                            Clear
                          </button>
                        </div>
                        <div className="w-full h-20 bg-gray-100 rounded-lg overflow-hidden">
                          {newCollectionBannerFile ? (
                            <img 
                              src={URL.createObjectURL(newCollectionBannerFile)} 
                              alt="Banner preview" 
                              className="w-full h-full object-cover"
                            />
                          ) : newCollectionBanner ? (
                            <>
                              <img 
                                src={newCollectionBanner} 
                                alt="Banner preview" 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                              <div className="w-full h-full hidden items-center justify-center text-gray-500 text-sm">
                                Invalid image URL
                              </div>
                            </>
                          ) : null}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex items-center justify-end space-x-3 flex-shrink-0">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading || (isCreatingNew && !newCollectionName.trim())}
            className="px-4 py-2 bg-[color:var(--color-dark)] text-white rounded-lg hover:bg-[color:var(--color-base)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save Bookmark'}
          </button>
        </div>
      </div>
    </div>
  );
}
