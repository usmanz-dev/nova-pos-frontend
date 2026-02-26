import { useEffect, useState } from "react";
import API from "../../api/axios";

const CashierSales = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState(null);

  useEffect(() => {
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
    fetchSales();
  }, []);

  const totalRevenue = sales
    .filter((s) => s.status === "completed")
    .reduce((sum, s) => sum + s.total, 0);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800">My Sales</h1>
        <p className="text-sm text-gray-400 mt-1">Your sales history</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-300 rounded-2xl p-4 shadow-sm text-center">
          <p className="text-xs text-black mb-1">Total Sales</p>
          <p className="text-2xl font-bold text-black">{sales.length}</p>
        </div>
        <div className="bg-yellow-200 rounded-2xl p-4 shadow-sm text-center">
          <p className="text-xs text-black mb-1">My Revenue</p>
          <p className="text-xl font-bold text-black">
            Rs. {totalRevenue.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider text-left">
                <th className="px-5 py-4">Invoice</th>
                <th className="px-5 py-4">Customer</th>
                <th className="px-5 py-4">Total</th>
                <th className="px-5 py-4">Payment</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Date</th>
                <th className="px-5 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-gray-400">
                    Loading...
                  </td>
                </tr>
              ) : sales.length > 0 ? (
                sales.map((sale) => (
                  <tr key={sale._id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-4 font-bold text-indigo-600">
                      {sale.invoiceNumber}
                    </td>
                    <td className="px-5 py-4 text-gray-700">{sale.customer}</td>
                    <td className="px-5 py-4 font-bold text-gray-800">
                      Rs. {sale.total?.toLocaleString()}
                    </td>
                    <td className="px-5 py-4 capitalize text-gray-500">
                      {sale.paymentMethod}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        sale.status === "completed"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {sale.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-400 text-xs">
                      {new Date(sale.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => setSelectedSale(sale)}
                        className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-3 py-1.5 rounded-lg text-xs font-medium transition"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-gray-400">
                    <div className="text-4xl mb-2">🧾</div>
                    No sales yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedSale && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="font-bold text-gray-800">{selectedSale.invoiceNumber}</h2>
              <button
                onClick={() => setSelectedSale(null)}
                className="text-gray-400 text-2xl font-bold"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Customer</span>
                  <span className="font-medium">{selectedSale.customer}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Payment</span>
                  <span className="font-medium capitalize">{selectedSale.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Date</span>
                  <span className="font-medium">
                    {new Date(selectedSale.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                {selectedSale.items?.map((item, i) => (
                  <div key={i} className="flex justify-between bg-gray-50 rounded-xl px-4 py-3 text-sm">
                    <div>
                      <p className="font-medium text-gray-800">{item.name}</p>
                      <p className="text-xs text-gray-400">
                        {item.quantity} x Rs. {item.price?.toLocaleString()}
                      </p>
                    </div>
                    <p className="font-bold text-gray-800">
                      Rs. {item.total?.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t pt-3 space-y-1 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span>Rs. {selectedSale.subtotal?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Tax</span>
                  <span>Rs. {selectedSale.tax?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Discount</span>
                  <span>- Rs. {selectedSale.discount?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-gray-800 text-base border-t pt-2">
                  <span>Total</span>
                  <span>Rs. {selectedSale.total?.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CashierSales;