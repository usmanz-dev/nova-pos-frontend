import { useEffect, useState } from "react";
import API from "../../api/axios";
import { FiLoader } from "react-icons/fi";

const Adjustments = () => {
  const [adjustments, setAdjustments] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
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

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Stock Adjustments</h1>
          <p className="text-sm text-gray-400 mt-1">Adjust product stock levels</p>
        </div>
        <button
          onClick={() => { setShowModal(true); setError(""); }}
          className="w-full sm:w-auto bg-gray-800 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition"
        >
          + New Adjustment
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider text-left">
                <th className="px-5 py-4">Product</th>
                <th className="px-5 py-4">Type</th>
                <th className="px-5 py-4">Quantity</th>
                <th className="px-5 py-4">Reason</th>
                <th className="px-5 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <div className=" flex justify-center items-center flex-col text-center py-16 text-gray-400">
                  <FiLoader className="text-4xl mb-2 mx-auto animate-spin text-gray-500" />
                  Loading...
                </div>
              ) : adjustments.length > 0 ? (
                adjustments.map((adj) => (
                  <tr key={adj._id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-4 font-semibold text-gray-800">
                      {adj.product?.name}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${adj.type === "addition"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-700"
                        }`}>
                        {adj.type}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-bold">
                      <span className={adj.type === "addition" ? "text-emerald-600" : "text-red-600"}>
                        {adj.type === "addition" ? "+" : "-"}{adj.quantity}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-400 text-xs">
                      {adj.reason || "—"}
                    </td>
                    <td className="px-5 py-4 text-gray-400 text-xs">
                      {new Date(adj.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-10 text-gray-400">
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
              <h2 className="text-lg font-bold text-gray-800">➕ New Adjustment</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 text-2xl font-bold">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product *</label>
                <select
                  value={form.product}
                  onChange={(e) => setForm({ ...form, product: e.target.value })}
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  <option value="">Select Product</option>
                  {products.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} (Stock: {p.stock})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, type: "addition" })}
                  className={`py-3 rounded-xl text-sm font-semibold transition ${form.type === "addition" ? "bg-indigo-600 hover:bg-gray-800 cursor-pointer text-white" : "bg-gray-100 text-gray-600"
                    }`}
                >
                  Addition
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, type: "subtraction" })}
                  className={`py-3 rounded-xl text-sm font-semibold transition ${form.type === "subtraction" ? "bg-red-500 text-white" : "bg-gray-800 hover:bg-indigo-600 cursor-pointer text-white"
                    }`}
                >
                  Subtraction
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                <input
                  type="number"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  required min="1"
                  placeholder="Enter quantity"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                <textarea
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  rows={2}
                  placeholder="Reason for adjustment..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 cursor-pointer text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-gray-800 hover:bg-indigo-600 cursor-pointer text-white text-sm font-semibold disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save"}
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