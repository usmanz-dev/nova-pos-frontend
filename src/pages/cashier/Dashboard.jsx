import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { SiCashapp } from "react-icons/si";
import { FaBasketShopping } from "react-icons/fa6";
import { IoCheckmarkDoneCircleSharp } from "react-icons/io5";
import { FaStore } from "react-icons/fa";
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

const CashierDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const { data } = await API.get("/sales");
        setSales(data.data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSales();
  }, []);

  const completedSales = sales.filter((s) => s.status === "completed");
  const totalRevenue = completedSales.reduce((sum, s) => sum + s.total, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center py-16 text-gray-400">
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
            Welcome, {user?.name}!
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Cashier Panel — Manage your sales
          </p>
        </div>
        {/* Quick POS Button */}
        <button
          onClick={() => navigate("/cashier/pos")}
          className="bg-gray-800 hover:bg-indigo-700 cursor-pointer flex gap-2 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition"
        >
          <FaStore className="mt-1" />Open POS
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="My Total Sales"
          value={sales.length}
          icon={<FaBasketShopping className="text-white text-3xl" />}
          bg="bg-gradient-to-r from-blue-500 to-indigo-600"
        />
        <StatCard
          title="My Revenue"
          value={`Rs. ${totalRevenue.toLocaleString()}`}
          icon={<SiCashapp className="text-white text-3xl" />}
          bg="bg-gradient-to-r from-yellow-500 to-orange-600"
        />
        <StatCard
          title="Completed"
          value={completedSales.length}
          icon={<IoCheckmarkDoneCircleSharp className="text-white text-3xl" />}
          bg="bg-gradient-to-r from-emerald-500 to-green-600"
        />
      </div>

      {/* Recent Sales */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-800">My Recent Sales</h2>
            <p className="text-sm text-gray-400">Your latest transactions</p>
          </div>
          <button
            onClick={() => navigate("/cashier/sales")}
            className="text-sm text-indigo-600 hover:underline font-medium"
          >
            View All →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider text-left">
                <th className="px-6 py-3">Invoice</th>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Total</th>
                <th className="px-6 py-3">Payment</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sales.length > 0 ? (
                sales.slice(0, 8).map((sale) => (
                  <tr key={sale._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-semibold text-indigo-600">
                      {sale.invoiceNumber}
                    </td>
                    <td className="px-6 py-4 text-gray-700">{sale.customer}</td>
                    <td className="px-6 py-4 font-bold text-gray-800">
                      Rs. {sale.total?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600 capitalize">
                        {sale.paymentMethod}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${sale.status === "completed"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-yellow-100 text-yellow-700"
                        }`}>
                        {sale.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                      {new Date(sale.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-gray-400">
                    <div className="text-4xl mb-2">🧾</div>
                    No sales yet — Go to POS to make a sale!
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

export default CashierDashboard;