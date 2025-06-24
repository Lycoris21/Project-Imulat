import React from "react";

export default function Reports() {
  return (
    <div className="min-h-[calc(100vh-5rem)] bg-base-gradient flex flex-col justify-center items-center text-center px-4">
      <h1 className="text-4xl font-bold text-blue-600 mb-4">Welcome to Project Imulat</h1>
      <p className="text-white text-lg max-w-xl mb-8">
        This is your reports page. Use this space to highlight recent activity, announcements, or quick access to features.
      </p>

      <div className="flex gap-4">
        <button className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-2xl shadow hover:bg-blue-700 transition">
          Go to Reports
        </button>
        <button className="px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-2xl hover:bg-gray-300 transition">
          View Claims
        </button>
      </div>
    </div>
  );
}
