const Stores = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Stores</h1>
          <p className="text-sm text-gray-400 mt-1">Manage your store branches</p>
        </div>
        <button className="w-full sm:w-auto bg-gray-800 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition">
          + Add Store
        </button>
      </div>
      <div className="bg-white rounded-2xl shadow-sm">
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">🏪</div>
          <p className="font-medium text-gray-500">No Stores Yet</p>
          <p className="text-sm mt-1">Add your first store</p>
        </div>
      </div>
    </div>
  );
};

export default Stores;