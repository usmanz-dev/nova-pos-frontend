import { useEffect, useState } from "react";
import API from "../../api/axios";
import { FiLoader } from "react-icons/fi";
import { FaSearch } from "react-icons/fa";

const Adjustments = () => {
  const [adjustments, setAdjustments] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    product: "", type: "addition", quantity: "", reason: "",
  });

  useEffect(() => {
    fetchAdjustments();
    fetchProducts();
  }, []);

  const fetchAdjustments = async () => {
    try {
      const { data } = await API.get("/adjustments");
      setAdjustments(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data } = await API.get("/products");
      setProducts(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await API.post("/adjustments", form);
      setShowModal(false);
      setForm({ product: "", type: "addition", quantity: "", reason: "" });
      fetchAdjustments();
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const filtered = adjustments.filter((a) =>
    a.product?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Adjustments</h1>
          <p className="text-sm text-gray-400 mt-1">
            Manage stock additions and subtractions
          </p>
        </div>
        <button
          onClick={() => { setShowModal(true); setError(""); }}
          className="w-full sm:w-auto bg-gray-800 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition"
        >
          + New Adjustment
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-blue-300 rounded-2xl p-4 shadow-sm text-center">
          <p className="text-xs text-black mb-1">Total</p>
          <p className="text-2xl font-bold text-black">{adjustments.length}</p>
        </div>
        <div className="bg-yellow-200 rounded-2xl p-4 shadow-sm text-center">
          <p className="text-xs text-black mb-1">Additions</p>
          <p className="text-2xl font-bold text-black">
            {adjustments.filter((a) => a.type === "addition").length}
          </p>
        </div>
        <div className="bg-red-200 rounded-2xl p-4 shadow-sm text-center col-span-2 sm:col-span-1">
          <p className="text-xs text-black mb-1">Subtractions</p>
          <p className="text-2xl font-bold text-black">
            {adjustments.filter((a) => a.type === "subtraction").length}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative w-full">
        {/* Icon */}
        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />

        {/* Input */}
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-gray-200 rounded-xl pl-10 pr-3 py-2 text-sm 
                     focus:outline-none focus:ring-2 focus:ring-gray-800"
        />
      </div>

      {/* Mobile Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:hidden gap-4">
        {loading ? (
          <div className="text-center py-10 text-gray-400">Loading...</div>
        ) : filtered.length > 0 ? (
          filtered.map((adj) => (
            <div key={adj._id} className="bg-white rounded-2xl shadow-sm p-5 space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-bold text-gray-800">{adj.product?.name}</p>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${adj.type === "addition"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-red-100 text-red-700"
                  }`}>
                  {adj.type === "addition" ? "+" : "-"}{adj.quantity}
                </span>
              </div>
              <p className="text-xs text-gray-500 font-mono">{adj.product?.sku}</p>
              {adj.reason && (
                <p className="text-xs text-gray-400">📝 {adj.reason}</p>
              )}
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>By: {adj.createdBy?.name}</span>
                <span>{new Date(adj.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10 text-gray-400">
            <div className="text-4xl mb-2">📋</div>
            No adjustments found
          </div>
        )}
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider text-left">
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">SKU</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Quantity</th>
                <th className="px-6 py-4">Current Stock</th>
                <th className="px-6 py-4">Reason</th>
                <th className="px-6 py-4">By</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className=" flex justify-center items-center flex-col text-center py-16 text-gray-400">
                    <FiLoader className="text-4xl mb-2 mx-auto animate-spin text-gray-500" />
                    Loading...
                  </div>
                </div>
              ) : filtered.length > 0 ? (
                filtered.map((adj) => (
                  <tr key={adj._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-semibold text-gray-800">
                      {adj.product?.name}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-400">
                      {adj.product?.sku}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${adj.type === "addition"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-700"
                        }`}>
                        {adj.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-bold text-base ${adj.type === "addition"
                        ? "text-emerald-600"
                        : "text-red-600"
                        }`}>
                        {adj.type === "addition" ? "+" : "-"}{adj.quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-700">
                      {adj.product?.stock} {adj.product?.unit}
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-xs">
                      {adj.reason || "—"}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {adj.createdBy?.name}
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-xs">
                      {new Date(adj.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-10 text-gray-400">
                    <div className="text-4xl mb-2">📋</div>
                    No adjustments found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-auto">

            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">
                ➕ New Adjustment
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              {/* Product */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product *
                </label>
                <select
                  value={form.product}
                  onChange={(e) => setForm({ ...form, product: e.target.value })}
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  <option value="">Select Product</option>
                  {products.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} (Stock: {p.stock} {p.unit})
                    </option>
                  ))}
                </select>
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adjustment Type *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, type: "addition" })}
                    className={`py-3 rounded-xl text-sm font-semibold transition ${form.type === "addition"
                      ? "bg-indigo-600 hover:bg-gray-800 cursor-pointer text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                  >
                    Addition
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, type: "subtraction" })}
                    className={`py-3 rounded-xl text-sm font-semibold transition ${form.type === "subtraction"
                      ? "bg-red-500 text-white"
                      : "bg-gray-800 hover:bg-indigo-600 cursor-pointer text-white"
                      }`}
                  >
                    Subtraction
                  </button>
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity *
                </label>
                <input
                  type="number"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  required
                  min="1"
                  placeholder="Enter quantity"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason
                </label>
                <textarea
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  rows={3}
                  placeholder="Why are you adjusting stock?"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                />
              </div>

              {/* Footer */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save Adjustment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Adjustments;