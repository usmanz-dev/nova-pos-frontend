import { useEffect, useState } from "react";
import API from "../../api/axios";
import { FiLoader } from "react-icons/fi";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", description: "" });

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data } = await API.get("/categories");
      setCategories(data.data);
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

  const openAddModal = () => {
    setEditCategory(null);
    setForm({ name: "", description: "" });
    setError("");
    setShowModal(true);
  };

  const openEditModal = (cat) => {
    setEditCategory(cat);
    setForm({ name: cat.name, description: cat.description || "" });
    setError("");
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      if (editCategory) {
        await API.put(`/categories/${editCategory._id}`, form);
      } else {
        await API.post("/categories", form);
      }
      setShowModal(false);
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      await API.delete(`/categories/${id}`);
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  // Har category k products count karo
  const getProductCount = (categoryId) => {
    return products.filter((p) => p.category?._id === categoryId).length;
  };

  const categoryIcons = {
    Rice: "🍚", Sugar: "🍬", Flour: "🌾",
    "Cooking Oil": "🫙", Milk: "🥛", Biscuits: "🍪",
    "Soft Drinks": "🥤", Tea: "☕", Soap: "🧼", Shampoo: "🧴",
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Categories</h1>
          <p className="text-sm text-gray-400 mt-1">
            Manage product categories
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="w-full sm:w-auto bg-gray-800 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition"
        >
          + Add Category
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-300 rounded-2xl p-4 shadow-sm text-center">
          <p className="text-xs text-black mb-1">Total Categories</p>
          <p className="text-2xl font-bold text-black">{categories.length}</p>
        </div>
        <div className="bg-yellow-200 rounded-2xl p-4 shadow-sm text-center">
          <p className="text-xs text-black mb-1">Total Products</p>
          <p className="text-2xl font-bold text-black">{products.length}</p>
        </div>
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className=" flex justify-center items-center flex-col text-center py-16 text-gray-400">
            <FiLoader className="text-4xl mb-2 mx-auto animate-spin text-gray-500" />
            Loading...
          </div>
        </div>
      ) : categories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div
              key={cat._id}
              className="bg-white rounded-2xl shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition"
            >
              {/* Icon */}
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-3xl">
                {categoryIcons[cat.name] || "📁"}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-800 truncate">{cat.name}</p>
                <p className="text-xs text-gray-400 mt-0.5 truncate">
                  {cat.description || "No description"}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                    {getProductCount(cat._id)} products
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cat.isActive
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-red-100 text-red-700"
                    }`}>
                    {cat.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-1.5">
                <button
                  onClick={() => openEditModal(cat)}
                  className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-3 py-1.5 rounded-lg text-xs font-medium transition"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(cat._id)}
                  className="bg-red-50 hover:bg-red-100 text-red-500 px-3 py-1.5 rounded-lg text-xs font-medium transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">📁</div>
          <p className="font-medium text-gray-500">No Categories Yet</p>
          <p className="text-sm mt-1">Add your first category</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-auto">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">
                {editCategory ? "✏️ Edit Category" : "➕ Add Category"}
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  placeholder="Beverages"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  placeholder="Category description..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition disabled:opacity-60"
                >
                  {saving ? "Saving..." : editCategory ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;