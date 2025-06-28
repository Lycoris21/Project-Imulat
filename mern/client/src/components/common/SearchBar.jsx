import React from "react";

export default function SearchBar({
  value,
  onChange,
  onSubmit,
  placeholder = "Search...",
}) {
  return (
    <form onSubmit={onSubmit} className="max-w-2xl mx-auto mb-4">
      <div className="relative flex">
        <input
          type="text"
          value={value}
          onChange={onChange}
          onFocus={(e) => e.target.select()}
          onClick={(e) => e.target.select()}
          placeholder={placeholder}
          className="w-full px-6 py-4 text-lg rounded-l-2xl text-white border border-gray-300 focus:ring-2 focus:ring-dark focus:outline-none"
        />
        <button
          type="submit"
          className="px-8 py-4 bg-white border border-l-0 border-gray-300 text-dark font-semibold rounded-r-2xl hover:bg-gray-50 transition cursor-pointer"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </form>
  );
}
