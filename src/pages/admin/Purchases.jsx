import { useState } from "react";

const Purchases = () => {
  const [purchases] = useState([]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Purchases</h1>
          <p className="text-sm text-gray-400 mt-1">Manage purchase orders</p>
        </div>
        <button className="w-full sm:w-auto bg-gray-800 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition">
          + New Purchase
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-blue-300 rounded-2xl p-4 shadow-sm text-center">
          <p className="text-xs text-black mb-1">Total</p>
          <p className="text-2xl font-bold text-black">0</p>
        </div>
        <div className="bg-yellow-200 rounded-2xl p-4 shadow-sm text-center">
          <p className="text-xs text-black mb-1">Pending</p>
          <p className="text-2xl font-bold text-black">0</p>
        </div>
        <div className="bg-red-200 rounded-2xl p-4 shadow-sm text-center">
          <p className="text-xs text-black mb-1">Received</p>
          <p className="text-2xl font-bold text-black">0</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm">
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">🛍️</div>
          <p className="font-medium text-gray-500">No Purchases Yet</p>
          <p className="text-sm mt-1">Create your first purchase order</p>
        </div>
      </div>
    </div>
  );
};

export default Purchases;