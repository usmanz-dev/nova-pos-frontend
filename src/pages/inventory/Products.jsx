import { useEffect, useState } from "react";
import API from "../../api/axios";
import { FaSearch } from "react-icons/fa";

const InventoryProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
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
    fetchProducts();
  }, []);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800">Products</h1>
        <p className="text-sm text-gray-400 mt-1">View all products and stock levels</p>
      </div>

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

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider text-left">
                <th className="px-5 py-4">Product</th>
                <th className="px-5 py-4">SKU</th>
                <th className="px-5 py-4">Category</th>
                <th className="px-5 py-4">Stock</th>
                <th className="px-5 py-4">Min Stock</th>
                <th className="px-5 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-gray-400">
                    Loading...
                  </td>
                </tr>
              ) : filtered.length > 0 ? (
                filtered.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.image || "https://via.placeholder.com/40"}
                          alt={p.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                        <p className="font-semibold text-gray-800">{p.name}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-gray-400">
                      {p.sku}
                    </td>
                    <td className="px-5 py-4 text-gray-600">
                      {p.category?.name}
                    </td>
                    <td className="px-5 py-4 font-bold text-gray-800">
                      {p.stock} {p.unit}
                    </td>
                    <td className="px-5 py-4 text-gray-500">{p.minStock}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${p.stock === 0
                          ? "bg-red-100 text-red-700"
                          : p.stock <= p.minStock
                            ? "bg-orange-100 text-orange-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}>
                        {p.stock === 0 ? "Out of Stock" : p.stock <= p.minStock ? "Low Stock" : "In Stock"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-gray-400">
                    <div className="text-4xl mb-2">📦</div>
                    No products found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InventoryProducts;