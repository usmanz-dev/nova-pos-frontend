import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";
import { SiCashapp } from "react-icons/si";
import { SiStockx } from "react-icons/si";
import { FaBox } from "react-icons/fa";
import { GoAlertFill } from "react-icons/go";
import { FiLoader } from "react-icons/fi";

const StatCard = ({ title, value, icon, bg }) => (
  <div className={`${bg} rounded-2xl p-5 flex items-center gap-4 shadow-sm`}>
    <div className="text-4xl">{icon}</div>
    <div>
      <p className="text-sm text-white font-medium">{title}</p>
      <h3 className="text-2xl font-bold text-white">{value}</h3>
    </div>
  </div>
);

const InventoryDashboard = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await API.get("/products");
        setProducts(data.data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const lowStock = products.filter((p) => p.stock <= p.minStock && p.stock > 0);
  const outOfStock = products.filter((p) => p.stock === 0);
  const inStock = products.filter((p) => p.stock > p.minStock);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className=" flex justify-center items-center flex-col text-center py-16 text-gray-400">
          <FiLoader className="text-4xl mb-2 mx-auto animate-spin text-gray-500" />
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Inventory Dashboard
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Monitor stock levels and manage products
          </p>
        </div>
        <button
          onClick={() => navigate("/inventory/products")}
          className="bg-gray-800 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition"
        >
          View Products
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Products"
          value={products.length}
          icon={<SiCashapp className="text-white text-3xl" />}

          bg="bg-gradient-to-r from-blue-500 to-indigo-600"
        />
        <StatCard
          title="In Stock"
          value={inStock.length}
          icon={<FaBox className="text-white text-3xl" />}
          bg="bg-gradient-to-r from-emerald-500 to-green-600"
        />
        <StatCard
          title="Low Stock"
          value={lowStock.length}
          icon={<GoAlertFill className="text-white text-3xl" />}
          bg="bg-gradient-to-r from-orange-500 to-yellow-600"
        />
        <StatCard
          title="Out of Stock"
          value={outOfStock.length}
          icon={<SiStockx className="text-white text-3xl" />}
          bg="bg-gradient-to-r from-red-500 to-red-700"
        />
      </div>

      {/* Low Stock Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-800">
              Low Stock Products
            </h2>
            <p className="text-sm text-gray-400">Products that need restocking</p>
          </div>
          <button
            onClick={() => navigate("/inventory/adjustments")}
            className="text-sm text-indigo-600 hover:underline font-medium"
          >
            Adjust Stock →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider text-left">
                <th className="px-6 py-3">Product</th>
                <th className="px-6 py-3">SKU</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Current Stock</th>
                <th className="px-6 py-3">Min Stock</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {lowStock.length > 0 ? (
                lowStock.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-semibold text-gray-800">
                      {product.name}
                    </td>
                    <td className="px-6 py-4 text-gray-500 font-mono text-xs">
                      {product.sku}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {product.category?.name}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700">
                        {product.stock} {product.unit}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {product.minStock} {product.unit}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${product.stock === 0
                        ? "bg-red-100 text-red-700"
                        : "bg-orange-100 text-orange-700"
                        }`}>
                        {product.stock === 0 ? "Out of Stock" : "Low Stock"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-gray-400">
                    <div className="text-4xl mb-2">✅</div>
                    All products have sufficient stock!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Out of Stock */}
      {outOfStock.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-red-50">
            <h2 className="text-lg font-bold text-red-600">
              ❌ Out of Stock Products
            </h2>
            <p className="text-sm text-gray-400">These products need immediate restocking</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-red-50 text-gray-500 text-xs uppercase tracking-wider text-left">
                  <th className="px-6 py-3">Product</th>
                  <th className="px-6 py-3">SKU</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {outOfStock.map((product) => (
                  <tr key={product._id} className="hover:bg-red-50 transition">
                    <td className="px-6 py-4 font-semibold text-gray-800">
                      {product.name}
                    </td>
                    <td className="px-6 py-4 text-gray-500 font-mono text-xs">
                      {product.sku}
                    </td>
                    <td className="px-6 py-4">{product.category?.name}</td>
                    <td className="px-6 py-4 font-bold text-gray-800">
                      Rs. {product.price?.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryDashboard;