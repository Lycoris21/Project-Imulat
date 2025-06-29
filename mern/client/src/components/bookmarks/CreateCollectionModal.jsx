import React, { useState, useEffect, useRef } from 'react';

export default function CreateCollectionModal({ isOpen, onClose, onCreate, collection = null }) {
  const [name, setName] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [bannerFile, setBannerFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const isEdit = !!collection;

  useEffect(() => {
    if (isOpen) {
      if (collection) {
        setName(collection.collectionName || '');
        setBannerUrl(collection.collectionBanner || '');
      } else {
        setName('');
        setBannerUrl('');
      }
      setBannerFile(null);
      setError('');
    }
  }, [isOpen, collection]);

  // Disable scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle ESC key press
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Collection name is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let finalBannerUrl = bannerUrl;

      // Upload banner file if selected
      if (bannerFile) {
        const formData = new FormData();
        formData.append("image", bannerFile);
        const response = await fetch('http://localhost:5050/api/uploads/cover-photo', {
          method: "POST",
          body: formData
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Banner upload failed");
        finalBannerUrl = data.url;
      }

      await onCreate({ name: name.trim(), bannerUrl: finalBannerUrl || null });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create collection');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-[#00000080] flex items-center justify-center z-50"
    >
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {isEdit ? 'Edit Collection' : 'Create New Collection'}
          </h2>
          <p className="text-gray-600 mt-1">
            {isEdit ? 'Update your collection details' : 'Organize your bookmarks into collections'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Collection Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                error ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter collection name"
              maxLength={100}
              disabled={loading}
            />
          </div>

          <div className="mb-6">
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
                    setBannerFile(e.target.files[0]);
                    if (e.target.files[0]) {
                      setBannerUrl(''); // Clear URL when file is selected
                    }
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  disabled={loading}
                />
                <div className="w-full px-3 py-2 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 bg-white flex items-center">
                  <span className="text-gray-900">Choose File</span>
                  <span className="mx-2 text-gray-400">|</span>
                  <span className={`${bannerFile ? 'text-gray-600' : 'text-gray-400'} flex-1 truncate text-left`}>
                    {bannerFile ? bannerFile.name : 'No file chosen'}
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
                value={bannerUrl}
                onChange={(e) => {
                  setBannerUrl(e.target.value);
                  if (e.target.value.trim()) {
                    setBannerFile(null); // Clear file when URL is entered
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com/banner-image.jpg"
                disabled={loading}
              />
            </div>

            {/* Preview */}
            {(bannerUrl || bannerFile) && (
              <div className="mt-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Preview:</p>
                  <button
                    type="button"
                    onClick={() => {
                      setBannerUrl('');
                      setBannerFile(null);
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
                <div className="w-full h-24 bg-gray-100 rounded-lg overflow-hidden">
                  {bannerFile ? (
                    <img 
                      src={URL.createObjectURL(bannerFile)} 
                      alt="Banner preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : bannerUrl ? (
                    <>
                      <img 
                        src={bannerUrl} 
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

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="px-4 py-2 bg-[#1E275E] text-white rounded-lg hover:bg-[#4B548B] disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isEdit ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                isEdit ? 'Update Collection' : 'Create Collection'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
