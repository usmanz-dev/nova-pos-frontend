import { useEffect, useState } from "react";
import API from "../../api/axios";
import { FiLoader } from "react-icons/fi";

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "", amount: "", category: "General", date: "", note: "",
  });

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const { data } = await API.get("/expenses");
      setExpenses(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await API.post("/expenses", form);
      setShowModal(false);
      setForm({ title: "", amount: "", category: "General", date: "", note: "" });
      fetchExpenses();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this expense?")) return;
    try {
      await API.delete(`/expenses/${id}`);
      fetchExpenses();
    } catch (err) {
      alert("Delete failed");
    }
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Expenses</h1>
          <p className="text-sm text-gray-400 mt-1">Track business expenses</p>
        </div>
        <button
          onClick={() => { setShowModal(true); setError(""); }}
          className="w-full sm:w-auto bg-gray-800 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition"
        >
          + Add Expense
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-300 rounded-2xl p-4 shadow-sm text-center">
          <p className="text-xs text-black mb-1">Total Expenses</p>
          <p className="text-2xl font-bold text-black">{expenses.length}</p>
        </div>
        <div className="bg-yellow-200 rounded-2xl p-4 shadow-sm text-center">
          <p className="text-xs text-black mb-1">Total Amount</p>
          <p className="text-xl font-bold text-black">
            Rs. {totalExpenses.toLocaleString()}
          </p>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className=" flex justify-center items-center flex-col text-center py-16 text-gray-400">
              <FiLoader className="text-4xl mb-2 mx-auto animate-spin text-gray-500" />
              Loading...
            </div>
          </div>
        ) : expenses.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {expenses.map((expense) => (
              <div
                key={expense._id}
                className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-xl">
                    💸
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{expense.title}</p>
                    <p className="text-xs text-gray-400">
                      {expense.category} •{" "}
                      {new Date(expense.createdAt).toLocaleDateString()}
                    </p>
                    {expense.note && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        📝 {expense.note}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-bold text-red-600">
                    Rs. {expense.amount?.toLocaleString()}
                  </p>
                  <button
                    onClick={() => handleDelete(expense._id)}
                    className="bg-red-50 hover:bg-red-100 text-red-500 px-3 py-1.5 rounded-lg text-xs font-medium transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-3">💸</div>
            <p className="font-medium text-gray-500">No Expenses Yet</p>
            <p className="text-sm mt-1">Add your first expense</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-auto">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">➕ Add Expense</h2>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  placeholder="Electricity Bill"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (Rs.) *
                </label>
                <input
                  type="number"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  required
                  min="0"
                  placeholder="5000"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  <option>General</option>
                  <option>Utilities</option>
                  <option>Rent</option>
                  <option>Salaries</option>
                  <option>Transport</option>
                  <option>Marketing</option>
                  <option>Maintenance</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Note (Optional)
                </label>
                <textarea
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                  rows={2}
                  placeholder="Additional details..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                />
              </div>

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
                  {saving ? "Saving..." : "Add Expense"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;