import React from 'react';
import { Link } from 'react-router-dom';

export default function BookmarkItem({ bookmark, onRemove }) {
  const { targetId, targetType } = bookmark;
  
  if (!targetId) return null;

  const getItemUrl = () => {
    return `/${targetType}s/${targetId._id}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <Link
            to={getItemUrl()}
            className="block group"
          >
            <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
              {targetId.title}
            </h3>
            
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {targetId.description || targetId.content}
            </p>
            
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <span className="inline-flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                {targetId.userId?.username}
              </span>
              
              <span className="inline-flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                {formatDate(targetId.createdAt)}
              </span>
              
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                targetType === 'claim' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {targetType === 'claim' ? 'Claim' : 'Report'}
              </span>
            </div>
          </Link>
        </div>
        
        <button
          onClick={() => onRemove(bookmark)}
          className="ml-4 p-1 text-gray-400 hover:text-red-600 transition-colors"
          title="Remove bookmark"
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
