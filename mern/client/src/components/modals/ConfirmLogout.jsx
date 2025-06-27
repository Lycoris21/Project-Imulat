import React from "react";

export default function ConfirmLogout({ isOpen, onCancel, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Confirm Logout</h2>
        <p className="text-sm text-gray-600 mb-4">Are you sure you want to log out?</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-dark text-white rounded-lg hover:bg-[#1E275E80] cursor-pointer"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
