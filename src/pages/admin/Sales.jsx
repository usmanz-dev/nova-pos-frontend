import { useEffect, useState } from "react";
import API from "../../api/axios";
import { FaSearch } from "react-icons/fa";

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [selectedSale, setSelectedSale] = useState(null);

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      const { data } = await API.get("/sales");
      setSales(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this sale?")) return;
    try {
      await API.delete(`/sales/${id}`);
      fetchSales();
    } catch (err) {
      alert("Delete failed");
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await API.put(`/sales/${id}`, { status });
      fetchSales();
      setSelectedSale(null);
    } catch (err) {
      alert("Update failed");
    }
  };

  const filtered = sales.filter((s) => {
    const matchSearch =
      s.invoiceNumber?.toLowerCase().includes(search.toLowerCase()) ||
      s.customer?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus ? s.status === filterStatus : true;
    return matchSearch && matchStatus;
  });

  const totalRevenue = sales
    .filter((s) => s.status === "completed")
    .reduce((sum, s) => sum + s.total, 0);

  const getStatusBadge = (status) => {
    if (status === "completed") return "bg-emerald-100 text-emerald-700";
    if (status === "pending") return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Sales</h1>
          <p className="text-sm text-gray-400 mt-1">
            View and manage all sales transactions
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-blue-200 rounded-2xl p-4 shadow-sm text-center">
          <p className="text-xs text-black mb-1">Total Sales</p>
          <p className="text-2xl font-bold text-black">{sales.length}</p>
        </div>
        <div className="bg-yellow-200 rounded-2xl p-4 shadow-sm text-center">
          <p className="text-xs text-black mb-1">Revenue</p>
          <p className="text-xl font-bold text-black">
            Rs. {totalRevenue.toLocaleString()}
          </p>
        </div>
        <div className="bg-red-200 rounded-2xl p-4 shadow-sm text-center">
          <p className="text-xs text-black mb-1">Pending</p>
          <p className="text-2xl font-bold text-black">
            {sales.filter((s) => s.status === "pending").length}
          </p>
        </div>
        <div className="bg-purple-200 rounded-2xl p-4 shadow-sm text-center">
          <p className="text-xs text-black mb-1">Refunded</p>
          <p className="text-2xl font-bold text-black">
            {sales.filter((s) => s.status === "refunded").length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
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
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="sm:w-44 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="">All Status</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      {/* Mobile Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:hidden gap-4">
        {loading ? (
          <div className="text-center py-10 text-gray-400">Loading...</div>
        ) : filtered.length > 0 ? (
          filtered.map((sale) => (
            <div key={sale._id} className="bg-white rounded-2xl shadow-sm p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-indigo-600 text-sm">
                  {sale.invoiceNumber}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(sale.status)}`}>
                  {sale.status}
                </span>
              </div>
              <div>
                <p className="font-semibold text-gray-800">{sale.customer}</p>
                <p className="text-xs text-gray-400">
                  Cashier: {sale.cashier?.name}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold text-gray-800">
                    Rs. {sale.total?.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-400 capitalize">
                    {sale.paymentMethod} •{" "}
                    {new Date(sale.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setSelectedSale(sale)}
                  className="flex-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 py-1.5 rounded-lg text-xs font-medium transition"
                >
                  View
                </button>
                <button
                  onClick={() => handleDelete(sale._id)}
                  className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-1.5 rounded-lg text-xs font-medium transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10 text-gray-400">
            <div className="text-4xl mb-2">🧾</div>
            No sales found
          </div>
        )}
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider text-left">
                <th className="px-6 py-4">Invoice</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Cashier</th>
                <th className="px-6 py-4">Items</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Payment</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="9" className="text-center py-10 text-gray-400">
                    Loading...
                  </td>
                </tr>
              ) : filtered.length > 0 ? (
                filtered.map((sale) => (
                  <tr key={sale._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-bold text-indigo-600">
                      {sale.invoiceNumber}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-800">
                      {sale.customer}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {sale.cashier?.name}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {sale.items?.length} items
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-800">
                      Rs. {sale.total?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600 capitalize">
                        {sale.paymentMethod}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(sale.status)}`}>
                        {sale.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-xs">
                      {new Date(sale.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedSale(sale)}
                          className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-3 py-1.5 rounded-lg text-xs font-medium transition"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDelete(sale._id)}
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
                  <td colSpan="9" className="text-center py-10 text-gray-400">
                    <div className="text-4xl mb-2">🧾</div>
                    No sales found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sale Detail Modal */}
      {selectedSale && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl">
              <div>
                <h2 className="text-lg font-bold text-gray-800">
                  {selectedSale.invoiceNumber}
                </h2>
                <p className="text-xs text-gray-400">Sale Details</p>
              </div>
              <button
                onClick={() => setSelectedSale(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-5">

              {/* Customer Info */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Customer</span>
                  <span className="font-medium text-gray-800">
                    {selectedSale.customer}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Cashier</span>
                  <span className="font-medium text-gray-800">
                    {selectedSale.cashier?.name}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Payment</span>
                  <span className="font-medium text-gray-800 capitalize">
                    {selectedSale.paymentMethod}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Date</span>
                  <span className="font-medium text-gray-800">
                    {new Date(selectedSale.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Items */}
              <div>
                <h3 className="font-semibold text-gray-700 mb-3">Items</h3>
                <div className="space-y-2">
                  {selectedSale.items?.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3"
                    >
                      <div>
                        <p className="font-medium text-gray-800 text-sm">
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {item.quantity} x Rs. {item.price?.toLocaleString()}
                        </p>
                      </div>
                      <p className="font-bold text-gray-800 text-sm">
                        Rs. {item.total?.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="border-t border-gray-100 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span>Rs. {selectedSale.subtotal?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tax</span>
                  <span>Rs. {selectedSale.tax?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Discount</span>
                  <span>Rs. {selectedSale.discount?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-gray-800 text-base border-t border-gray-100 pt-2">
                  <span>Total</span>
                  <span>Rs. {selectedSale.total?.toLocaleString()}</span>
                </div>
              </div>

              {/* Status Update */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Update Status
                </p>
                <div className="flex gap-2">
                  {["completed", "pending", "refunded"].map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusUpdate(selectedSale._id, status)}
                      className={`flex-1 py-2 rounded-xl text-xs font-semibold capitalize transition ${selectedSale.status === status
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sales;