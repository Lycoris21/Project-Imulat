import React from 'react';
import BookmarkItem from './BookmarkItem';

export default function BookmarkSection({ title, bookmarks, onRemoveBookmark, emptyMessage }) {
  const filteredBookmarks = bookmarks.filter(bookmark => 
    bookmark.targetType === title.toLowerCase().slice(0, -1) // 'Reports' -> 'report', 'Claims' -> 'claim'
  );

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          {title} ({filteredBookmarks.length})
        </h2>
      </div>
      
      {filteredBookmarks.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </div>
          <p className="text-gray-500">{emptyMessage}</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredBookmarks.map((bookmark) => (
            <BookmarkItem
              key={`${bookmark.targetType}-${bookmark.targetId._id}`}
              bookmark={bookmark}
              onRemove={onRemoveBookmark}
            />
          ))}
        </div>
      )}
    </div>
  );
}
