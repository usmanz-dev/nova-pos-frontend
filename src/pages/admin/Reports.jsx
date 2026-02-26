import { useEffect, useState } from "react";
import API from "../../api/axios";
import { FiLoader } from "react-icons/fi";

const Reports = () => {
  const [activeTab, setActiveTab] = useState("sales");
  const [salesReport, setSalesReport] = useState(null);
  const [inventoryReport, setInventoryReport] = useState(null);
  const [financialReport, setFinancialReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = startDate && endDate ? `?startDate=${startDate}&endDate=${endDate}` : "";
      const [sales, inventory, financial] = await Promise.all([
        API.get(`/reports/sales${params}`),
        API.get("/reports/inventory"),
        API.get("/reports/financial"),
      ]);
      setSalesReport(sales.data.data);
      setInventoryReport(inventory.data.data);
      setFinancialReport(financial.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { key: "sales", label: "Sales" },
    { key: "inventory", label: "Inventory" },
    { key: "financial", label: "Financial" },
  ];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800">Reports</h1>
        <p className="text-sm text-gray-400 mt-1">
          View detailed business reports
        </p>
      </div>

      {/* Date Filter */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <p className="text-sm font-medium text-gray-700 mb-3">
          Filter by Date Range
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="text-xs text-gray-400 mb-1 block">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs text-gray-400 mb-1 block">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div className="flex items-end gap-2">
            <button
              onClick={fetchReports}
              className="px-5 py-2.5 bg-gray-800 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition"
            >
              Apply
            </button>
            <button
              onClick={() => {
                setStartDate("");
                setEndDate("");
                setTimeout(fetchReports, 100);
              }}
              className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-sm font-semibold transition"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition ${activeTab === tab.key
                ? "bg-gray-800 text-white shadow-sm"
                : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className=" flex justify-center items-center flex-col text-center py-16 text-gray-400">
            <FiLoader className="text-4xl mb-2 mx-auto animate-spin text-gray-500" />
            Loading...
          </div>
        </div>
      ) : (
        <>
          {/* Sales Report */}
          {activeTab === "sales" && salesReport && (
            <div className="space-y-4">

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
                  <p className="text-xs text-gray-400 mb-1">Total Sales</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {salesReport.totalSales}
                  </p>
                </div>
                <div className="bg-emerald-50 rounded-2xl p-4 shadow-sm text-center">
                  <p className="text-xs text-emerald-500 mb-1">Revenue</p>
                  <p className="text-xl font-bold text-emerald-700">
                    Rs. {salesReport.totalRevenue?.toLocaleString()}
                  </p>
                </div>
                <div className="bg-blue-50 rounded-2xl p-4 shadow-sm text-center">
                  <p className="text-xs text-blue-400 mb-1">Tax Collected</p>
                  <p className="text-xl font-bold text-blue-700">
                    Rs. {salesReport.totalTax?.toLocaleString()}
                  </p>
                </div>
                <div className="bg-orange-50 rounded-2xl p-4 shadow-sm text-center">
                  <p className="text-xs text-orange-400 mb-1">Discounts</p>
                  <p className="text-xl font-bold text-orange-600">
                    Rs. {salesReport.totalDiscount?.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Payment Method Breakdown */}
              <div className="bg-white rounded-2xl shadow-sm p-5">
                <h3 className="font-bold text-gray-800 mb-4">
                  Sales by Payment Method
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {Object.entries(salesReport.byPaymentMethod || {}).map(
                    ([method, amount]) => (
                      <div
                        key={method}
                        className="bg-gray-50 rounded-xl p-3 text-center"
                      >
                        <p className="text-xs text-gray-400 capitalize mb-1">
                          {method === "cash" && "💵"}
                          {method === "card" && "💳"}
                          {method === "online" && "📱"}
                          {method === "other" && "🔄"} {method}
                        </p>
                        <p className="font-bold text-gray-800 text-sm">
                          Rs. {amount?.toLocaleString()}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Daily Sales */}
              {salesReport.dailySales?.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-100">
                    <h3 className="font-bold text-gray-800">Daily Sales</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider text-left">
                          <th className="px-5 py-3">Date</th>
                          <th className="px-5 py-3">Sales Count</th>
                          <th className="px-5 py-3">Revenue</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {salesReport.dailySales.map((day) => (
                          <tr key={day.date} className="hover:bg-gray-50 transition">
                            <td className="px-5 py-3 font-medium text-gray-800">
                              {new Date(day.date).toLocaleDateString("en-PK", {
                                weekday: "short",
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </td>
                            <td className="px-5 py-3 text-gray-600">
                              {day.count} sales
                            </td>
                            <td className="px-5 py-3 font-bold text-emerald-600">
                              Rs. {day.revenue?.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Sales List */}
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                  <h3 className="font-bold text-gray-800">All Sales</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider text-left">
                        <th className="px-5 py-3">Invoice</th>
                        <th className="px-5 py-3">Customer</th>
                        <th className="px-5 py-3">Cashier</th>
                        <th className="px-5 py-3">Total</th>
                        <th className="px-5 py-3">Payment</th>
                        <th className="px-5 py-3">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {salesReport.sales?.length > 0 ? (
                        salesReport.sales.map((sale) => (
                          <tr key={sale._id} className="hover:bg-gray-50 transition">
                            <td className="px-5 py-3 font-bold text-indigo-600">
                              {sale.invoiceNumber}
                            </td>
                            <td className="px-5 py-3 text-gray-700">
                              {sale.customer}
                            </td>
                            <td className="px-5 py-3 text-gray-500">
                              {sale.cashier?.name}
                            </td>
                            <td className="px-5 py-3 font-bold text-gray-800">
                              Rs. {sale.total?.toLocaleString()}
                            </td>
                            <td className="px-5 py-3 capitalize text-gray-500">
                              {sale.paymentMethod}
                            </td>
                            <td className="px-5 py-3 text-gray-400 text-xs">
                              {new Date(sale.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="text-center py-8 text-gray-400">
                            No sales found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Inventory Report */}
          {activeTab === "inventory" && inventoryReport && (
            <div className="space-y-4">

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
                  <p className="text-xs text-gray-400 mb-1">Total Products</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {inventoryReport.totalProducts}
                  </p>
                </div>
                <div className="bg-indigo-50 rounded-2xl p-4 shadow-sm text-center">
                  <p className="text-xs text-indigo-400 mb-1">Stock Value</p>
                  <p className="text-lg font-bold text-indigo-700">
                    Rs. {inventoryReport.totalStockValue?.toLocaleString()}
                  </p>
                </div>
                <div className="bg-orange-50 rounded-2xl p-4 shadow-sm text-center">
                  <p className="text-xs text-orange-400 mb-1">Low Stock</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {inventoryReport.lowStockCount}
                  </p>
                </div>
                <div className="bg-red-50 rounded-2xl p-4 shadow-sm text-center">
                  <p className="text-xs text-red-400 mb-1">Out of Stock</p>
                  <p className="text-2xl font-bold text-red-600">
                    {inventoryReport.outOfStockCount}
                  </p>
                </div>
              </div>

              {/* Low Stock Products */}
              {inventoryReport.lowStockProducts?.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-orange-100">
                    <h3 className="font-bold text-orange-600">
                      ⚠️ Low Stock Products
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-orange-50 text-gray-500 text-xs uppercase tracking-wider text-left">
                          <th className="px-5 py-3">Product</th>
                          <th className="px-5 py-3">SKU</th>
                          <th className="px-5 py-3">Category</th>
                          <th className="px-5 py-3">Stock</th>
                          <th className="px-5 py-3">Min Stock</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {inventoryReport.lowStockProducts.map((p) => (
                          <tr key={p._id} className="hover:bg-orange-50 transition">
                            <td className="px-5 py-3 font-semibold text-gray-800">
                              {p.name}
                            </td>
                            <td className="px-5 py-3 font-mono text-xs text-gray-400">
                              {p.sku}
                            </td>
                            <td className="px-5 py-3 text-gray-600">
                              {p.category?.name}
                            </td>
                            <td className="px-5 py-3">
                              <span className="px-2 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700">
                                {p.stock} {p.unit}
                              </span>
                            </td>
                            <td className="px-5 py-3 text-gray-500">
                              {p.minStock}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* All Products */}
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                  <h3 className="font-bold text-gray-800">All Products Stock</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider text-left">
                        <th className="px-5 py-3">Product</th>
                        <th className="px-5 py-3">Category</th>
                        <th className="px-5 py-3">Stock</th>
                        <th className="px-5 py-3">Price</th>
                        <th className="px-5 py-3">Stock Value</th>
                        <th className="px-5 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {inventoryReport.products?.map((p) => (
                        <tr key={p._id} className="hover:bg-gray-50 transition">
                          <td className="px-5 py-3 font-semibold text-gray-800">
                            {p.name}
                          </td>
                          <td className="px-5 py-3 text-gray-500">
                            {p.category?.name}
                          </td>
                          <td className="px-5 py-3 font-bold text-gray-700">
                            {p.stock} {p.unit}
                          </td>
                          <td className="px-5 py-3 text-gray-600">
                            Rs. {p.price?.toLocaleString()}
                          </td>
                          <td className="px-5 py-3 font-semibold text-indigo-600">
                            Rs. {(p.stock * p.costPrice)?.toLocaleString()}
                          </td>
                          <td className="px-5 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${p.stock === 0
                                ? "bg-red-100 text-red-700"
                                : p.stock <= p.minStock
                                  ? "bg-orange-100 text-orange-700"
                                  : "bg-emerald-100 text-emerald-700"
                              }`}>
                              {p.stock === 0
                                ? "Out of Stock"
                                : p.stock <= p.minStock
                                  ? "Low Stock"
                                  : "In Stock"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Financial Report */}
          {activeTab === "financial" && financialReport && (
            <div className="space-y-4">

              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-emerald-50 rounded-2xl p-6 shadow-sm text-center">
                  <p className="text-sm text-emerald-500 mb-2">Total Revenue</p>
                  <p className="text-3xl font-bold text-emerald-700">
                    Rs. {financialReport.totalRevenue?.toLocaleString()}
                  </p>
                </div>
                <div className="bg-red-50 rounded-2xl p-6 shadow-sm text-center">
                  <p className="text-sm text-red-400 mb-2">Total Expenses</p>
                  <p className="text-3xl font-bold text-red-600">
                    Rs. {financialReport.totalExpenses?.toLocaleString()}
                  </p>
                </div>
                <div className={`rounded-2xl p-6 shadow-sm text-center ${financialReport.netProfit >= 0 ? "bg-indigo-50" : "bg-red-50"
                  }`}>
                  <p className="text-sm text-indigo-400 mb-2">Net Profit</p>
                  <p className={`text-3xl font-bold ${financialReport.netProfit >= 0
                      ? "text-indigo-700"
                      : "text-red-600"
                    }`}>
                    Rs. {financialReport.netProfit?.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Profit Bar */}
              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-4">
                  Revenue vs Expenses
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Revenue</span>
                      <span>Rs. {financialReport.totalRevenue?.toLocaleString()}</span>
                    </div>
                    <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: "100%" }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Expenses</span>
                      <span>Rs. {financialReport.totalExpenses?.toLocaleString()}</span>
                    </div>
                    <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-400 rounded-full"
                        style={{
                          width: financialReport.totalRevenue > 0
                            ? `${Math.min((financialReport.totalExpenses / financialReport.totalRevenue) * 100, 100)}%`
                            : "0%",
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Net Profit</span>
                      <span>Rs. {financialReport.netProfit?.toLocaleString()}</span>
                    </div>
                    <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${financialReport.netProfit >= 0
                            ? "bg-indigo-500"
                            : "bg-red-500"
                          }`}
                        style={{
                          width: financialReport.totalRevenue > 0
                            ? `${Math.min(Math.abs(financialReport.netProfit / financialReport.totalRevenue) * 100, 100)}%`
                            : "0%",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Reports;