import { useEffect, useState } from "react";
import API from "../../api/axios";
import { FaSearch } from "react-icons/fa";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "", sku: "", barcode: "", category: "",
    price: "", costPrice: "", stock: "", minStock: "",
    unit: "pcs", description: "", image: "",
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await API.get("/products");
      setProducts(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await API.get("/categories");
      setCategories(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const openAddModal = () => {
    setEditProduct(null);
    setForm({
      name: "", sku: "", barcode: "", category: "",
      price: "", costPrice: "", stock: "", minStock: "",
      unit: "pcs", description: "", image: "",
    });
    setError("");
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setEditProduct(product);
    setForm({
      name: product.name,
      sku: product.sku,
      barcode: product.barcode || "",
      category: product.category?._id || "",
      price: product.price,
      costPrice: product.costPrice,
      stock: product.stock,
      minStock: product.minStock,
      unit: product.unit,
      description: product.description || "",
      image: product.image || "",
    });
    setError("");
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      if (editProduct) {
        await API.put(`/products/${editProduct._id}`, form);
      } else {
        await API.post("/products", form);
      }
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await API.delete(`/products/${id}`);
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  const filtered = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchCategory = filterCategory
      ? p.category?._id === filterCategory
      : true;
    return matchSearch && matchCategory;
  });

  const totalProducts = products.length;
  const lowStock = products.filter((p) => p.stock <= p.minStock && p.stock > 0).length;
  const outOfStock = products.filter((p) => p.stock === 0).length;

  const getStockBadge = (product) => {
    if (product.stock === 0)
      return "bg-red-100 text-red-700";
    if (product.stock <= product.minStock)
      return "bg-orange-100 text-orange-700";
    return "bg-emerald-100 text-emerald-700";
  };

  const getStockLabel = (product) => {
    if (product.stock === 0) return "Out of Stock";
    if (product.stock <= product.minStock) return "Low Stock";
    return "In Stock";
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Products</h1>
          <p className="text-sm text-gray-400 mt-1">
            Manage your store products
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="w-full sm:w-auto bg-gray-800 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition"
        >
          + Add Product
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {/* Total Products */}
        <div className="bg-blue-300 rounded-2xl p-4 shadow-md text-center">
          <p className="text-xs text-black mb-1">Total</p>
          <p className="text-2xl font-bold text-black">{totalProducts}</p>
        </div>

        {/* Low Stock */}
        <div className="bg-yellow-200 rounded-2xl p-4 shadow-md text-center">
          <p className="text-xs text-black mb-1">Low Stock</p>
          <p className="text-2xl font-bold text-black">{lowStock}</p>
        </div>

        {/* Out of Stock */}
        <div className="bg-red-200 rounded-2xl p-4 shadow-md text-center">
          <p className="text-xs text-black mb-1">Out of Stock</p>
          <p className="text-2xl font-bold text-black">{outOfStock}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative w-full">
          
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />

          
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-200 rounded-xl pl-10 pr-3 py-2 text-sm 
                       focus:outline-none focus:ring-2 focus:ring-gray-800"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="sm:w-48 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Products Grid — Mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:hidden gap-4">
        {loading ? (
          <div className="col-span-2 text-center py-10 text-gray-400">
            Loading...
          </div>
        ) : filtered.length > 0 ? (
          filtered.map((product) => (
            <div
              key={product._id}
              className="bg-white rounded-2xl shadow-sm overflow-hidden"
            >
              {/* Product Image */}
              <div className="relative">
                <img
                  src={product.image || "https://via.placeholder.com/400x200?text=No+Image"}
                  alt={product.name}
                  className="w-full h-36 object-cover"
                />
                <span className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold ${getStockBadge(product)}`}>
                  {getStockLabel(product)}
                </span>
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h3 className="font-bold text-gray-800 text-sm">{product.name}</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  {product.sku} • {product.category?.name}
                </p>
                <div className="flex items-center justify-between mt-3">
                  <div>
                    <p className="text-lg font-bold text-indigo-600">
                      Rs. {product.price?.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-400">
                      Stock: {product.stock} {product.unit}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <button
                      onClick={() => openEditModal(product)}
                      className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-3 py-1.5 rounded-lg text-xs font-medium transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg text-xs font-medium transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-2 text-center py-10 text-gray-400">
            <div className="text-4xl mb-2">📦</div>
            No products found
          </div>
        )}
      </div>

      {/* Products Table — Desktop */}
      <div className="hidden lg:block bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider text-left">
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">SKU</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Sale Price</th>
                <th className="px-6 py-4">Cost Price</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-10 text-center text-gray-400">
                    Loading...
                  </td>
                </tr>
              ) : filtered.length > 0 ? (
                filtered.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50 transition">
                    {/* Product with image */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.image || "https://via.placeholder.com/40"}
                          alt={product.name}
                          className="w-12 h-12 rounded-xl object-cover"
                        />
                        <div>
                          <p className="font-semibold text-gray-800">
                            {product.name}
                          </p>
                          <p className="text-xs text-gray-400">{product.unit}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-500">
                      {product.sku}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {product.category?.name || "—"}
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-800">
                      Rs. {product.price?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      Rs. {product.costPrice?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStockBadge(product)}`}>
                        {product.stock} {product.unit}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStockBadge(product)}`}>
                        {getStockLabel(product)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(product)}
                          className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-3 py-1.5 rounded-lg text-xs font-medium transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg text-xs font-medium transition"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-10 text-center text-gray-400">
                    <div className="text-4xl mb-2">📦</div>
                    No products found
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
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl">
              <h2 className="text-lg font-bold text-gray-800">
                {editProduct ? "✏️ Edit Product" : "➕ Add New Product"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    placeholder="Coca Cola 500ml"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>

                {/* SKU */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SKU *
                  </label>
                  <input
                    type="text"
                    value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    required
                    placeholder="CC-001"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    required
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Unit */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit
                  </label>
                  <select
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  >
                    <option value="pcs">Pieces</option>
                    <option value="kg">Kilogram</option>
                    <option value="g">Gram</option>
                    <option value="ltr">Liter</option>
                    <option value="box">Box</option>
                    <option value="pack">Pack</option>
                    <option value="bag">Bag</option>
                  </select>
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sale Price (Rs.) *
                  </label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    required
                    min="0"
                    placeholder="80"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>

                {/* Cost Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cost Price (Rs.)
                  </label>
                  <input
                    type="number"
                    value={form.costPrice}
                    onChange={(e) => setForm({ ...form, costPrice: e.target.value })}
                    min="0"
                    placeholder="60"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>

                {/* Stock */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    min="0"
                    placeholder="100"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>

                {/* Min Stock */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Stock (Alert)
                  </label>
                  <input
                    type="number"
                    value={form.minStock}
                    onChange={(e) => setForm({ ...form, minStock: e.target.value })}
                    min="0"
                    placeholder="10"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>

                {/* Image URL */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image URL
                  </label>
                  <input
                    type="text"
                    value={form.image}
                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                  {/* Image Preview */}
                  {form.image && (
                    <img
                      src={form.image}
                      alt="Preview"
                      className="mt-2 w-20 h-20 rounded-xl object-cover border border-gray-200"
                    />
                  )}
                </div>

                {/* Barcode */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Barcode (Optional)
                  </label>
                  <input
                    type="text"
                    value={form.barcode}
                    onChange={(e) => setForm({ ...form, barcode: e.target.value })}
                    placeholder="Optional"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>

                {/* Description */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={3}
                    placeholder="Product description..."
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-gray-800 hover:bg-indigo-700 text-white text-sm font-semibold transition disabled:opacity-60"
                >
                  {saving ? "Saving..." : editProduct ? "Update Product" : "Add Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;