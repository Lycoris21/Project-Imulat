import React from 'react';
import { Link } from 'react-router-dom';

export default function CollectionCard({ collection, onEdit, onDelete }) {
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow relative group">
      {/* Main clickable link covering the entire card */}
      <Link
        to={`/bookmarks/collection/${collection._id}`}
        className="block"
      >
        <div className="flex">
          {/* Banner Section - Left Side */}
          <div className="w-32 flex-shrink-0">
            {collection?.collectionBanner && collection.collectionBanner !== null && collection.collectionBanner.trim() !== '' ? (
              <img 
                src={collection.collectionBanner} 
                alt={`${collection.collectionName} banner`}
                className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                onError={(e) => {
                  console.log('Image failed to load:', collection.collectionBanner);
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                <svg className="w-8 h-8 text-[#1E275E] group-hover:text-blue-600 transition-colors" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                </svg>
              </div>
            )}
            {/* Fallback for failed image loads */}
            <div className="w-full h-full bg-gray-100 hidden items-center justify-center group-hover:bg-gray-200 transition-colors">
              <svg className="w-8 h-8 text-[#1E275E] group-hover:text-blue-600 transition-colors" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
              </svg>
            </div>
          </div>
          
          {/* Content Section - Right Side */}
          <div className="flex-1 p-4">
            <div className="flex items-start justify-between h-full">
              <div className="flex-1">
                <div className="mb-2">
                  <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors text-lg">
                    {collection.collectionName}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {collection.bookmarkCount} {collection.bookmarkCount === 1 ? 'bookmark' : 'bookmarks'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
      
      {/* Action buttons positioned absolutely */}
      <div className="absolute top-4 right-4 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onEdit(collection);
          }}
          className="p-1 text-gray-400 hover:text-blue-600 transition-colors bg-white rounded shadow-sm"
          title="Edit collection"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete(collection);
          }}
          className="p-1 text-gray-400 hover:text-red-600 transition-colors bg-white rounded shadow-sm"
          title="Delete collection"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
}
