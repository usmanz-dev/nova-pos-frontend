import { useEffect, useState } from "react";
import API from "../../api/axios";
import {
  FaSearch, FaPlus, FaTrash, FaTimes, FaEdit,
  FaBoxOpen, FaExclamationTriangle, FaBan
} from "react-icons/fa";
import { FiPackage } from "react-icons/fi";
import { MdInventory } from "react-icons/md";

// ── Unit options
const UNIT_OPTIONS = [
  "pcs", "kg", "g", "ltr", "ml", "box", "pack",
  "bag", "dozen", "pair", "roll", "bottle", "pouch", "sachet",
];

// ── Empty form state
const EMPTY_FORM = {
  name: "", sku: "", barcode: "", category: "",
  price: "", costPrice: "", stock: "", minStock: "5",
  unit: "pcs", description: "", image: "",
};

// ── Empty variant form
const EMPTY_VARIANT = { name: "", unit: "", price: "", stock: "", sku: "" };

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
const Products = () => {
  const [products,   setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [showModal,  setShowModal]  = useState(false);
  const [editProduct,setEditProduct]= useState(null);
  const [search,     setSearch]     = useState("");
  const [filterCat,  setFilterCat]  = useState("");
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState("");

  // Form state
  const [form, setForm] = useState(EMPTY_FORM);

  // Variants state — this is what gets saved
  const [variants,     setVariants]     = useState([]);
  const [variantForm,  setVariantForm]  = useState(EMPTY_VARIANT);
  const [editVarIdx,   setEditVarIdx]   = useState(null); // index being edited

  // Inline category create
  const [showCatInput, setShowCatInput] = useState(false);
  const [newCatName,   setNewCatName]   = useState("");
  const [savingCat,    setSavingCat]    = useState(false);

  // ── Fetch
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await API.get("/products");
      setProducts(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await API.get("/categories");
      setCategories(data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  // ── Create category inline
  const handleCreateCategory = async () => {
    if (!newCatName.trim()) return;
    setSavingCat(true);
    try {
      const { data } = await API.post("/categories", { name: newCatName.trim() });
      const newCat = data.data;
      setCategories((prev) => [...prev, newCat]);
      setForm((prev) => ({ ...prev, category: newCat._id }));
      setNewCatName("");
      setShowCatInput(false);
    } catch (err) {
      alert(err.response?.data?.message || "Category create failed");
    } finally {
      setSavingCat(false);
    }
  };

  // ── Open Add Modal
  const openAddModal = () => {
    setEditProduct(null);
    setForm(EMPTY_FORM);
    setVariants([]);
    setVariantForm(EMPTY_VARIANT);
    setEditVarIdx(null);
    setShowCatInput(false);
    setNewCatName("");
    setError("");
    setShowModal(true);
  };

  // ── Open Edit Modal — properly load existing variants
  const openEditModal = (product) => {
    setEditProduct(product);
    setForm({
      name:        product.name        || "",
      sku:         product.sku         || "",
      barcode:     product.barcode     || "",
      category:    product.category?._id || "",
      price:       product.price       ?? "",
      costPrice:   product.costPrice   ?? "",
      stock:       product.stock       ?? "",
      minStock:    product.minStock    ?? "5",
      unit:        product.unit        || "pcs",
      description: product.description || "",
      image:       product.image       || "",
    });

    // ── KEY FIX: Load existing variants with all fields including unit ──
    const loadedVariants = (product.variants || []).map((v) => ({
      _id:   v._id   || null,   // keep MongoDB _id for existing variants
      name:  v.name  || "",
      unit:  v.unit  || "",
      price: v.price ?? 0,
      stock: v.stock ?? 0,
      sku:   v.sku   || "",
    }));
    setVariants(loadedVariants);
    setVariantForm(EMPTY_VARIANT);
    setEditVarIdx(null);
    setShowCatInput(false);
    setNewCatName("");
    setError("");
    setShowModal(true);
  };

  // ── Variant: Add new OR update existing (by editVarIdx)
  const handleAddVariant = () => {
    const trimmedName = variantForm.name.trim();
    const priceValue = variantForm.price;
    
    if (!trimmedName) {
      alert("⚠️ Please enter a variant name/size");
      return;
    }
    
    if (priceValue === "" || priceValue === "0" || isNaN(priceValue)) {
      alert("⚠️ Please enter a valid price");
      return;
    }

    // Build the display name: "500 ml" or just "Red"
    const displayName = variantForm.unit
      ? `${trimmedName} ${variantForm.unit}`
      : trimmedName;

    const newVariant = {
      name:  displayName,
      unit:  variantForm.unit  || "",
      price: Number(priceValue),
      stock: Number(variantForm.stock) || 0,
      sku:   variantForm.sku   || "",
    };

    if (editVarIdx !== null) {
      // Update existing variant — preserve _id if it exists
      const updated = [...variants];
      updated[editVarIdx] = {
        ...newVariant,
        _id: variants[editVarIdx]._id || null,
      };
      setVariants(updated);
      setEditVarIdx(null);
      alert(`✅ Variant "${displayName}" updated`);
    } else {
      // Add new variant — no _id (will be assigned by MongoDB)
      setVariants([...variants, newVariant]);
      alert(`✅ Variant added! Total: ${variants.length + 1}`);
    }
    console.log("[handleAddVariant] Variants state updated. Total:", variants.length + 1);
    setVariantForm(EMPTY_VARIANT);
  };

  // ── Variant: Start editing an existing variant
  const handleEditVariant = (index) => {
    const v = variants[index];
    // Split displayName back into name + unit if unit stored separately
    setVariantForm({
      name:  v.unit ? v.name.replace(` ${v.unit}`, "").trim() : v.name,
      unit:  v.unit  || "",
      price: v.price ?? "",
      stock: v.stock ?? "",
      sku:   v.sku   || "",
    });
    setEditVarIdx(index);
  };

  // ── Variant: Cancel edit
  const handleCancelEditVariant = () => {
    setVariantForm(EMPTY_VARIANT);
    setEditVarIdx(null);
  };

  // ── Variant: Remove
  const handleRemoveVariant = (index) => {
    setVariants(variants.filter((_, i) => i !== index));
    if (editVarIdx === index) {
      setVariantForm(EMPTY_VARIANT);
      setEditVarIdx(null);
    }
  };

  // ── Submit: clean variants & send to backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      console.log("[handleSubmit] Current variants state:", variants);
      // ── KEY FIX: only send fields the backend expects, remove null _ids ──
      const cleanVariants = variants.map((v) => {
        const obj = {
          name:  v.name,
          price: Number(v.price),
          stock: Number(v.stock) || 0,
          unit:  v.unit || "",
          sku:   v.sku  || "",
        };
        // Include _id only for existing variants (so Mongo updates them)
        if (v._id) obj._id = v._id;
        return obj;
      });

      const payload = {
        ...form,
        price:     Number(form.price),
        costPrice: Number(form.costPrice) || 0,
        stock:     Number(form.stock)     || 0,
        minStock:  Number(form.minStock)  || 5,
        variants:  cleanVariants, // always include; backend handles empty array
      };

      // DEBUG: show what we are sending so variant issues can be spotted
      console.debug("[Products] submitting payload", payload);
      console.log("[Products] variants in payload:", payload.variants);

      if (editProduct) {
        await API.put(`/products/${editProduct._id}`, payload);
      } else {
        await API.post("/products", payload);
      }
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  // ── Delete product
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await API.delete(`/products/${id}`);
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  // ── Filter
  const filtered = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat ? p.category?._id === filterCat : true;
    return matchSearch && matchCat;
  });

  const totalProducts = products.length;
  const lowStock      = products.filter((p) => p.stock > 0 && p.stock <= p.minStock).length;
  const outOfStock    = products.filter((p) => p.stock === 0).length;

  const getStockBadge = (p) => {
    if (p.stock === 0)           return "bg-red-100 text-red-700";
    if (p.stock <= p.minStock)   return "bg-orange-100 text-orange-700";
    return "bg-emerald-100 text-emerald-700";
  };

  const getStockLabel = (p) => {
    if (p.stock === 0)         return "Out of Stock";
    if (p.stock <= p.minStock) return "Low Stock";
    return "In Stock";
  };

  // ─────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────
  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div className="bg-white rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Products</h1>
          <p className="text-sm text-gray-400 mt-0.5">Manage your store products & variants</p>
        </div>
        <button
          onClick={openAddModal}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition shadow-md shadow-indigo-200"
        >
          <FaPlus className="text-xs" /> Add Product
        </button>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50 text-center">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2">
            <MdInventory className="text-blue-600 text-lg" />
          </div>
          <p className="text-xs text-gray-500 font-medium">Total</p>
          <p className="text-2xl font-bold text-gray-800">{totalProducts}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50 text-center">
          <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-2">
            <FaExclamationTriangle className="text-orange-500 text-sm" />
          </div>
          <p className="text-xs text-gray-500 font-medium">Low Stock</p>
          <p className="text-2xl font-bold text-orange-600">{lowStock}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50 text-center">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-2">
            <FaBan className="text-red-500 text-sm" />
          </div>
          <p className="text-xs text-gray-500 font-medium">Out of Stock</p>
          <p className="text-2xl font-bold text-red-600">{outOfStock}</p>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>
        <select
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value)}
          className="sm:w-44 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* ── Mobile Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:hidden gap-4">
        {loading ? (
          <div className="col-span-2 text-center py-12 text-gray-400">Loading...</div>
        ) : filtered.length > 0 ? (
          filtered.map((product) => (
            <div key={product._id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="relative">
                <img
                  src={product.image || `https://ui-avatars.com/api/?name=${product.name}&background=e0e7ff&color=4f46e5&size=200`}
                  alt={product.name}
                  className="w-full h-36 object-cover"
                />
                <span className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold ${getStockBadge(product)}`}>
                  {getStockLabel(product)}
                </span>
                {product.variants?.length > 0 && (
                  <span className="absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-bold bg-indigo-600 text-white">
                    {product.variants.length} variants
                  </span>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-800">{product.name}</h3>
                <p className="text-xs text-gray-400 mt-0.5">{product.sku} · {product.category?.name}</p>

                {/* Variants preview */}
                {product.variants?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {product.variants.slice(0, 3).map((v, i) => (
                      <span key={i} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs rounded-lg font-medium">
                        {v.name} — Rs.{v.price}
                      </span>
                    ))}
                    {product.variants.length > 3 && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-lg">
                        +{product.variants.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between mt-3">
                  <div>
                    <p className="text-lg font-bold text-indigo-600">Rs. {product.price?.toLocaleString()}</p>
                    <p className="text-xs text-gray-400">Stock: {product.stock} {product.unit}</p>
                  </div>
                  <div className="flex gap-2">
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
          <div className="col-span-2 text-center py-12 text-gray-400">
            <FiPackage className="text-4xl mx-auto mb-2" />
            <p>No products found</p>
          </div>
        )}
      </div>

      {/* ── Desktop Table ── */}
      <div className="hidden lg:block bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-400 text-xs uppercase tracking-wider text-left">
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">SKU</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Sale Price</th>
                <th className="px-6 py-4">Cost Price</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4">Variants</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan="9" className="text-center py-10 text-gray-400">Loading...</td></tr>
              ) : filtered.length > 0 ? (
                filtered.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.image || `https://ui-avatars.com/api/?name=${product.name}&background=e0e7ff&color=4f46e5&size=80`}
                          alt={product.name}
                          className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                        />
                        <div>
                          <p className="font-semibold text-gray-800">{product.name}</p>
                          <p className="text-xs text-gray-400">{product.unit}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-500">{product.sku}</td>
                    <td className="px-6 py-4 text-gray-600">{product.category?.name || "—"}</td>
                    <td className="px-6 py-4 font-bold text-gray-800">Rs. {product.price?.toLocaleString()}</td>
                    <td className="px-6 py-4 text-gray-500">Rs. {product.costPrice?.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getStockBadge(product)}`}>
                        {product.stock} {product.unit}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {product.variants?.length > 0 ? (
                        <div className="space-y-1">
                          {product.variants.slice(0, 2).map((v, i) => (
                            <span key={i} className="block px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs rounded-lg font-medium w-fit">
                              {v.name} · Rs.{v.price}
                            </span>
                          ))}
                          {product.variants.length > 2 && (
                            <span className="text-xs text-gray-400">+{product.variants.length - 2} more</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStockBadge(product)}`}>
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
                  <td colSpan="9" className="text-center py-12 text-gray-400">
                    <FaBoxOpen className="text-4xl mx-auto mb-2" />
                    <p>No products found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ══════════════════════════════════════
          ADD / EDIT MODAL
      ══════════════════════════════════════ */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl my-4">

            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl z-10">
              <h2 className="text-lg font-bold text-gray-800">
                {editProduct ? "✏️ Edit Product" : "➕ Add New Product"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition"
              >
                <FaTimes className="text-gray-500 text-xs" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              {/* ── Basic Info ── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                  <input
                    type="text" value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required placeholder="Coca Cola"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SKU *</label>
                  <input
                    type="text" value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    required placeholder="CC-001"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>

                {/* Category */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  {!showCatInput ? (
                    <div className="flex gap-2">
                      <select
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                        required
                        className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      >
                        <option value="">Select Category</option>
                        {categories.map((cat) => (
                          <option key={cat._id} value={cat._id}>{cat.name}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => setShowCatInput(true)}
                        className="px-3 py-2.5 bg-gray-100 hover:bg-indigo-50 hover:text-indigo-600 text-gray-600 rounded-xl text-xs font-bold transition flex items-center gap-1 whitespace-nowrap"
                      >
                        <FaPlus className="text-[10px]" /> New
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text" value={newCatName}
                        onChange={(e) => setNewCatName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleCreateCategory())}
                        placeholder="Category name..."
                        autoFocus
                        className="flex-1 border border-indigo-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      />
                      <button
                        type="button" onClick={handleCreateCategory}
                        disabled={savingCat || !newCatName.trim()}
                        className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition"
                      >
                        {savingCat ? "..." : "Save"}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setShowCatInput(false); setNewCatName(""); }}
                        className="w-10 h-10 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-xl flex items-center justify-center transition"
                      >
                        <FaTimes className="text-xs" />
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <select
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  >
                    {UNIT_OPTIONS.map((u) => (<option key={u} value={u}>{u}</option>))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sale Price (Rs.) *</label>
                  <input
                    type="number" value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    required min="0" placeholder="80"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cost Price (Rs.)</label>
                  <input
                    type="number" value={form.costPrice}
                    onChange={(e) => setForm({ ...form, costPrice: e.target.value })}
                    min="0" placeholder="60"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                  <input
                    type="number" value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    min="0" placeholder="100"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Stock (Alert)</label>
                  <input
                    type="number" value={form.minStock}
                    onChange={(e) => setForm({ ...form, minStock: e.target.value })}
                    min="0" placeholder="10"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                  <input
                    type="text" value={form.image}
                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                    placeholder="https://..."
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                  {form.image && (
                    <img src={form.image} alt="Preview" className="mt-2 w-20 h-20 rounded-xl object-cover border border-gray-200" />
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Barcode</label>
                  <input
                    type="text" value={form.barcode}
                    onChange={(e) => setForm({ ...form, barcode: e.target.value })}
                    placeholder="Optional"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={2} placeholder="Product description..."
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                  />
                </div>
              </div>

              {/* ════════════════════════════════
                  VARIANTS SECTION
              ════════════════════════════════ */}
              <div className="border-t border-gray-100 pt-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-gray-700">
                      Product Variants
                      <span className="text-gray-400 font-normal ml-1">(Optional)</span>
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      e.g. 500ml, 1kg, Small/Large, Red/Blue — each with own price & stock
                    </p>
                  </div>
                  {variants.length > 0 && (
                    <span className="text-xs font-bold px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-lg">
                      {variants.length} variant{variants.length > 1 ? "s" : ""}
                    </span>
                  )}
                </div>

                {/* ── Existing variants list ── */}
                {variants.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {variants.map((v, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between rounded-xl px-4 py-2.5 border transition ${
                          editVarIdx === index
                            ? "bg-indigo-50 border-indigo-300"
                            : "bg-gray-50 border-gray-100"
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-wrap min-w-0">
                          <span className="text-sm font-bold text-gray-800 truncate">{v.name}</span>
                          <span className="text-xs font-semibold text-indigo-600 flex-shrink-0">
                            Rs. {Number(v.price).toLocaleString()}
                          </span>
                          <span className="text-xs text-gray-400 flex-shrink-0">
                            Stock: {v.stock}
                          </span>
                          {v.sku && (
                            <span className="text-xs text-gray-300 font-mono flex-shrink-0">
                              {v.sku}
                            </span>
                          )}
                        </div>
                        <div className="flex gap-1.5 flex-shrink-0 ml-2">
                          <button
                            type="button"
                            onClick={() => handleEditVariant(index)}
                            className="w-7 h-7 bg-indigo-50 hover:bg-indigo-100 text-indigo-500 rounded-lg flex items-center justify-center transition"
                          >
                            <FaEdit className="text-[10px]" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveVariant(index)}
                            className="w-7 h-7 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg flex items-center justify-center transition"
                          >
                            <FaTrash className="text-[10px]" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* ── Add / Edit variant form ── */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="text-xs font-semibold text-gray-600 mb-3">
                    {editVarIdx !== null ? "✏️ Edit Variant" : "➕ Add Variant"}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {/* Name */}
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-xs text-gray-500 mb-1 font-medium">Name / Size *</label>
                      <input
                        type="text"
                        value={variantForm.name}
                        onChange={(e) => setVariantForm({ ...variantForm, name: e.target.value })}
                        placeholder="500, Red, Large"
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                      />
                    </div>

                    {/* Unit */}
                    <div>
                      <label className="block text-xs text-gray-500 mb-1 font-medium">Unit</label>
                      <select
                        value={variantForm.unit}
                        onChange={(e) => setVariantForm({ ...variantForm, unit: e.target.value })}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                      >
                        <option value="">No unit</option>
                        {UNIT_OPTIONS.map((u) => (<option key={u} value={u}>{u}</option>))}
                      </select>
                    </div>

                    {/* Price */}
                    <div>
                      <label className="block text-xs text-gray-500 mb-1 font-medium">Price (Rs.) *</label>
                      <input
                        type="number"
                        value={variantForm.price}
                        onChange={(e) => setVariantForm({ ...variantForm, price: e.target.value })}
                        placeholder="80"
                        min="0"
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                      />
                    </div>

                    {/* Stock */}
                    <div>
                      <label className="block text-xs text-gray-500 mb-1 font-medium">Stock</label>
                      <input
                        type="number"
                        value={variantForm.stock}
                        onChange={(e) => setVariantForm({ ...variantForm, stock: e.target.value })}
                        placeholder="0"
                        min="0"
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddVariant())}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                      />
                    </div>

                    {/* SKU (optional) */}
                    <div className="col-span-2 sm:col-span-2">
                      <label className="block text-xs text-gray-500 mb-1 font-medium">Variant SKU <span className="text-gray-300">(optional)</span></label>
                      <input
                        type="text"
                        value={variantForm.sku}
                        onChange={(e) => setVariantForm({ ...variantForm, sku: e.target.value })}
                        placeholder="CC-500ML"
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                      />
                    </div>

                    {/* Preview + Buttons */}
                    <div className="col-span-2 flex items-end gap-2">
                      {variantForm.name && (
                        <div className="flex-1 text-xs text-gray-400 pb-2">
                          Preview:{" "}
                          <span className="font-semibold text-indigo-600">
                            {variantForm.unit ? `${variantForm.name} ${variantForm.unit}` : variantForm.name}
                          </span>
                        </div>
                      )}
                      <div className="flex gap-2 ml-auto">
                        {editVarIdx !== null && (
                          <button
                            type="button"
                            onClick={handleCancelEditVariant}
                            className="h-9 px-3 bg-gray-200 hover:bg-gray-300 text-gray-600 rounded-xl text-xs font-bold transition"
                          >
                            Cancel
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={handleAddVariant}
                          disabled={!variantForm.name.trim() || variantForm.price === ""}
                          className="h-9 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl flex items-center gap-1.5 text-xs font-bold transition"
                        >
                          <FaPlus className="text-[10px]" />
                          {editVarIdx !== null ? "Update" : "Add"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Footer Buttons ── */}
              <div className="flex items-center justify-end gap-3 pt-1">
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
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition disabled:opacity-60 shadow-md shadow-indigo-200"
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