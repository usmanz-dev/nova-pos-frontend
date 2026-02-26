import { useEffect, useState, useMemo } from "react";
import API from "../../api/axios";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line
} from "recharts";
import {
  FiShoppingCart, FiPackage, FiUsers, FiDollarSign,
  FiAlertTriangle, FiRefreshCw, FiCalendar, FiTrendingUp,
  FiFilter
} from "react-icons/fi";
import { MdPointOfSale, MdPayments } from "react-icons/md";
import { BsCheckCircleFill, BsGraphUpArrow } from "react-icons/bs";
import { HiOutlineCurrencyRupee } from "react-icons/hi2";
import { RiStockLine } from "react-icons/ri";
import { FaMoneyCheckDollar } from "react-icons/fa6";

const COLORS = ["#6366f1","#22c55e","#f59e0b","#ec4899","#06b6d4","#f97316","#8b5cf6","#14b8a6"];

// ─────────────────────────────────────────────
// Stat Card
// ─────────────────────────────────────────────
const StatCard = ({ title, value, icon, from, to, sub }) => (
  <div
    className="relative overflow-hidden rounded-2xl p-4 sm:p-5 text-white shadow-lg"
    style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
  >
    <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-white/10" />
    <div className="relative flex items-start justify-between gap-2">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider opacity-80 truncate leading-tight">{title}</p>
        <h3 className="text-lg sm:text-2xl font-extrabold mt-1 leading-tight break-all">{value}</h3>
        {sub && <p className="text-xs opacity-70 mt-1 truncate">{sub}</p>}
      </div>
      <div className="text-xl sm:text-2xl bg-white/20 p-2 sm:p-2.5 rounded-xl">{icon}</div>
    </div>
  </div>
);

// ─────────────────────────────────────────────
// Tooltips
// ─────────────────────────────────────────────
const BarTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-xl p-3 text-xs">
      <p className="font-bold text-gray-600 mb-1 border-b pb-1">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex justify-between gap-4">
          <span style={{ color: p.fill }} className="font-medium">{p.name}</span>
          <span className="font-bold text-gray-700">Rs. {Number(p.value).toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

const PieTip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-xl p-3 text-xs">
      <p className="font-bold capitalize mb-1" style={{ color: payload[0].payload.fill }}>{payload[0].name}</p>
      <p className="text-gray-700 font-semibold">Rs. {Number(payload[0].value).toLocaleString()}</p>
    </div>
  );
};

// ─────────────────────────────────────────────
// Date Filter Buttons
// ─────────────────────────────────────────────
const FILTERS = [
  { key: "today",   label: "Today" },
  { key: "weekly",  label: "Weekly" },
  { key: "monthly", label: "Monthly" },
  { key: "custom",  label: "Custom" },
];

// ─────────────────────────────────────────────
// Helper: get date range from filter
// ─────────────────────────────────────────────
const getDateRange = (filter, customStart, customEnd) => {
  const now = new Date();
  let start = new Date();
  let end   = new Date();
  end.setHours(23, 59, 59, 999);

  if (filter === "today") {
    start.setHours(0, 0, 0, 0);
  } else if (filter === "weekly") {
    start.setDate(now.getDate() - 6);
    start.setHours(0, 0, 0, 0);
  } else if (filter === "monthly") {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
    start.setHours(0, 0, 0, 0);
  } else if (filter === "custom" && customStart && customEnd) {
    start = new Date(customStart);
    start.setHours(0, 0, 0, 0);
    end = new Date(customEnd);
    end.setHours(23, 59, 59, 999);
  } else {
    // default: last 7 days
    start.setDate(now.getDate() - 6);
    start.setHours(0, 0, 0, 0);
  }
  return { start, end };
};

// ─────────────────────────────────────────────
// Main Dashboard
// ─────────────────────────────────────────────
const Dashboard = () => {
  const [sales,    setSales]    = useState([]);
  const [products, setProducts] = useState([]);
  const [users,    setUsers]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // ── Date filter state
  const [activeFilter, setActiveFilter] = useState("weekly");
  const [customStart,  setCustomStart]  = useState("");
  const [customEnd,    setCustomEnd]    = useState("");
  const [showCustom,   setShowCustom]   = useState(false);

  // ── Fetch
  const fetchAll = async (manual = false) => {
    if (manual) setRefreshing(true);
    try {
      const [sRes, pRes, uRes] = await Promise.all([
        API.get("/sales"),
        API.get("/products"),
        API.get("/users"),
      ]);
      setSales(sRes.data.data    || []);
      setProducts(pRes.data.data || []);
      setUsers(uRes.data.data    || []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAll();
    const t = setInterval(() => fetchAll(false), 20000);
    return () => clearInterval(t);
  }, []);

  // ── Filter change handler
  const handleFilter = (key) => {
    setActiveFilter(key);
    if (key === "custom") {
      setShowCustom(true);
    } else {
      setShowCustom(false);
    }
  };

  // ─────────────────────────────────────────
  // COMPUTED — useMemo so recalculates when
  // filter or sales changes
  // ─────────────────────────────────────────
  const { start, end } = useMemo(
    () => getDateRange(activeFilter, customStart, customEnd),
    [activeFilter, customStart, customEnd]
  );

  // All completed sales
  const allCompleted = useMemo(
    () => sales.filter((s) => s.status === "completed"),
    [sales]
  );

  // Filtered completed sales by date range
  const filteredSales = useMemo(
    () => allCompleted.filter((s) => {
      const d = new Date(s.createdAt);
      return d >= start && d <= end;
    }),
    [allCompleted, start, end]
  );

  // Stats from filtered sales
  const totalRevenue  = filteredSales.reduce((sum, s) => sum + (s.total    || 0), 0);
  const totalTax      = filteredSales.reduce((sum, s) => sum + (s.tax      || 0), 0);
  const totalDiscount = filteredSales.reduce((sum, s) => sum + (s.discount || 0), 0);

  // All time stats (not filtered)
  const pendingSales  = sales.filter((s) => s.status === "pending");
  const refundedSales = sales.filter((s) => s.status === "refunded");

  // Today stats always (for header cards)
  const todayStart = new Date(); todayStart.setHours(0,0,0,0);
  const todaySales   = allCompleted.filter((s) => new Date(s.createdAt) >= todayStart);
  const todayRevenue = todaySales.reduce((sum, s) => sum + (s.total || 0), 0);

  // Low stock
  const lowStockProducts = products.filter((p) => p.stock <= p.minStock);
  const outOfStock       = products.filter((p) => p.stock === 0);

  // Recent 5 from filtered
  const recentSales = [...filteredSales]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  // ── Bar chart: group filtered sales by date
  // ── Sorted: previous days first, today last
  const barData = useMemo(() => {
    const map = {};
    const todayDateStr = new Date().toLocaleDateString("en-PK", { month: "short", day: "numeric" });

    filteredSales.forEach((sale) => {
      const d = new Date(sale.createdAt);
      let key;
      if (activeFilter === "today") {
        // Group by hour — store raw hour number for sorting
        key = `${d.getHours()}:00`;
      } else {
        key = d.toLocaleDateString("en-PK", { month: "short", day: "numeric" });
      }
      if (!map[key]) map[key] = { date: key, Revenue: 0, Count: 0, _rawDate: d };
      map[key].Revenue += sale.total || 0;
      map[key].Count   += 1;
    });

    const entries = Object.values(map);

    if (activeFilter === "today") {
      // Sort by hour ascending (0:00, 1:00, ..., 23:00) — natural chronological order
      entries.sort((a, b) => {
        const hourA = parseInt(a.date.split(":")[0], 10);
        const hourB = parseInt(b.date.split(":")[0], 10);
        return hourA - hourB;
      });
    } else {
      // Sort by actual date ascending → previous days first, today last
      entries.sort((a, b) => new Date(a._rawDate) - new Date(b._rawDate));
    }

    // Remove internal helper field before returning
    return entries.map(({ _rawDate, ...rest }) => rest);
  }, [filteredSales, activeFilter]);

  // ── Top products
  const topProds = useMemo(() => {
    const map = {};
    filteredSales.forEach((sale) => {
      (sale.items || []).forEach((item) => {
        if (!map[item.name]) map[item.name] = { name: item.name, value: 0, qty: 0 };
        map[item.name].value += item.total    || 0;
        map[item.name].qty   += item.quantity || 0;
      });
    });
    return Object.values(map)
      .sort((a, b) => b.value - a.value)
      .slice(0, 6)
      .map((p, i) => ({ ...p, fill: COLORS[i % COLORS.length] }));
  }, [filteredSales]);

  // ── Payment pie
  const payPie = useMemo(() => {
    const map = {};
    filteredSales.forEach((sale) => {
      const m = sale.paymentMethod || "other";
      if (!map[m]) map[m] = { name: m.charAt(0).toUpperCase() + m.slice(1), value: 0 };
      map[m].value += sale.total || 0;
    });
    return Object.values(map).map((p, i) => ({ ...p, fill: COLORS[i % COLORS.length] }));
  }, [filteredSales]);

  const statusBg = (s) =>
    s === "completed" ? "bg-emerald-100 text-emerald-700"
    : s === "pending"   ? "bg-yellow-100 text-yellow-700"
    : "bg-red-100 text-red-700";

  const hr    = new Date().getHours();
  const greet = hr < 12 ? "Good Morning" : hr < 17 ? "Good Afternoon" : "Good Evening";

  const filterLabel = FILTERS.find((f) => f.key === activeFilter)?.label || "Weekly";

  // ── Loading
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-medium text-sm">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5">

      {/* ══════════════════════════════════════
          HEADER
      ══════════════════════════════════════ */}
      <div className="bg-white rounded-2xl px-4 sm:px-6 py-4 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-800">
               <span className="text-gray-800">Admin POS</span>
            </h1>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          DATE FILTER BAR
      ══════════════════════════════════════ */}
      <div className="bg-white rounded-2xl px-4 sm:px-6 py-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <FiFilter className="text-indigo-500 text-sm" />
          <span className="text-sm font-bold text-gray-700">Filter Period</span>
          <span className="ml-auto text-xs text-gray-400">
            {filteredSales.length} sales in period
          </span>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => handleFilter(f.key)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex-1 sm:flex-none min-w-0 ${
                activeFilter === f.key
                  ? "bg-gray-800 text-white shadow-md shadow-indigo-200"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Custom Date Inputs */}
        {showCustom && (
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block font-medium">Start Date</label>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block font-medium">End Date</label>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  if (customStart && customEnd) setShowCustom(true);
                }}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-xl text-sm font-semibold transition"
              >
                Apply
              </button>
            </div>
          </div>
        )}

        {/* Active range display */}
        <p className="text-xs text-gray-400 mt-2">
          📅 {start.toLocaleDateString("en-PK", { month: "short", day: "numeric", year: "numeric" })}
          {" → "}
          {end.toLocaleDateString("en-PK", { month: "short", day: "numeric", year: "numeric" })}
        </p>
      </div>

      {/* ══════════════════════════════════════
          ROW 1 — STAT CARDS (filtered)
      ══════════════════════════════════════ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title={`${filterLabel} Revenue`}
          value={`Rs. ${totalRevenue.toLocaleString()}`}
          icon={<FaMoneyCheckDollar  />}
          from="#06b6d4" to="#0891b2"
          sub={`${filteredSales.length} sales`}
        />
        <StatCard
          title={`${filterLabel} Sales`} 
          value={filteredSales.length}
          icon={<MdPointOfSale />}
          from="#8b5cf6" to="#6d28d9"
          sub={`Rs. ${totalRevenue.toLocaleString()}`}
        />
        <StatCard
          title="Tax Collected"
          value={`Rs. ${totalTax.toLocaleString()}`}
          icon={<FiDollarSign />}
          from="#f97316" to="#ea580c"
          sub={`Discount: Rs. ${totalDiscount.toLocaleString()}`}
        />
        <StatCard
          title="Products Sold"
          value={filteredSales.reduce((sum, s) => sum + (s.items?.length || 0), 0)}
          icon={<FiPackage />}
          from="#ec4899" to="#be185d"
          sub={`${topProds.length} unique items`}
        />
      </div>

      {/* ══════════════════════════════════════
          ROW 2 — ALWAYS STATS (not filtered)
      ══════════════════════════════════════ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Today's Revenue"
          value={`Rs. ${todayRevenue.toLocaleString()}`}
          icon={<FiDollarSign />}
          from="#f59e0b" to="#d97706"
          sub={`${todaySales.length} sales today`}
        />
        <StatCard
          title="Total Users"
          value={users.length}
          icon={<FiUsers />}
          from="#10b981" to="#059669"
          sub="System users"
        />
        <StatCard
          title="Low Stock Alert"
          value={lowStockProducts.length}
          icon={<FiAlertTriangle />}
          from="#ef4444" to="#dc2626"
          sub={`${outOfStock.length} out of stock`}
        />
        <StatCard
          title="Total Products"
          value={products.length}
          icon={<BsGraphUpArrow />}
          from="#6366f1" to="#4f46e5"
          sub={`${products.filter(p => p.isActive).length} active`}
        />
      </div>

      {/* ══════════════════════════════════════
          CHARTS — BAR + PIE
      ══════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">

        {/* Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-gray-800 text-sm sm:text-base">
                Sales Revenue — {filterLabel}
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {barData.length} data points
              </p>
            </div>
            <span className="text-xs bg-indigo-50 text-indigo-600 font-semibold px-2.5 py-1.5 rounded-full">
              Rs. {totalRevenue.toLocaleString()}
            </span>
          </div>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData} barSize={28} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: "#9ca3af" }}
                  axisLine={false} tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#9ca3af" }}
                  axisLine={false} tickLine={false}
                  tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
                  width={35}
                />
                <Tooltip content={<BarTip />} cursor={{ fill: "#f9fafb" }} />
                <Bar dataKey="Revenue" name="Revenue" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-gray-300">
              <MdPointOfSale className="text-5xl mb-3" />
              <p className="text-sm text-gray-400 font-medium">No sales in this period</p>
            </div>
          )}
        </div>

        {/* Top Products Pie */}
        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">
          <h2 className="font-bold text-gray-800 mb-1 text-sm sm:text-base">Top Products</h2>
          <p className="text-xs text-gray-400 mb-4">By revenue — {filterLabel}</p>
          {topProds.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={topProds}
                    cx="50%" cy="50%"
                    innerRadius={42} outerRadius={70}
                    paddingAngle={4} dataKey="value"
                  >
                    {topProds.map((e, i) => <Cell key={i} fill={e.fill} />)}
                  </Pie>
                  <Tooltip content={<PieTip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-3 space-y-2">
                {topProds.slice(0, 5).map((p, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.fill }} />
                      <span className="text-gray-600 truncate">{p.name}</span>
                    </div>
                    <span className="font-bold text-gray-700 ml-2">
                      Rs. {p.value?.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-gray-300">
              <FiPackage className="text-5xl mb-3" />
              <p className="text-sm text-gray-400">No products in this period</p>
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════
          TOP PRODUCTS TABLE + PAYMENT PIE
      ══════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">

        {/* Top Products Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-50 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-gray-800 text-sm sm:text-base">Top Selling Products</h2>
              <p className="text-xs text-gray-400 mt-0.5">{filterLabel} — by revenue</p>
            </div>
            <span className="text-xs bg-indigo-50 text-indigo-600 font-bold px-2.5 py-1.5 rounded-full">
              {topProds.length}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-400 text-xs uppercase tracking-wider text-left">
                  <th className="px-4 sm:px-6 py-3">#</th>
                  <th className="px-4 sm:px-6 py-3">Product</th>
                  <th className="px-4 sm:px-6 py-3">Qty</th>
                  <th className="px-4 sm:px-6 py-3">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {topProds.length > 0 ? topProds.map((p, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition">
                    <td className="px-4 sm:px-6 py-3">
                      <span
                        className="w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center text-white"
                        style={{ backgroundColor: p.fill }}
                      >
                        {i + 1}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-3 font-semibold text-gray-700 text-xs sm:text-sm">
                      {p.name}
                    </td>
                    <td className="px-4 sm:px-6 py-3">
                      <span
                        className="px-2 py-1 rounded-full text-xs font-bold"
                        style={{ backgroundColor: p.fill + "22", color: p.fill }}
                      >
                        {p.qty}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-3 font-bold text-gray-800 text-xs sm:text-sm">
                      Rs. {p.value?.toLocaleString()}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" className="text-center py-10 text-gray-300">
                      <FiShoppingCart className="text-3xl mx-auto mb-2" />
                      <p className="text-sm text-gray-400">No sales in this period</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Pie */}
        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">
          <h2 className="font-bold text-gray-800 mb-1 text-sm sm:text-base">Payment Methods</h2>
          <p className="text-xs text-gray-400 mb-4">{filterLabel} — by type</p>
          {payPie.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={payPie}
                    cx="50%" cy="50%"
                    outerRadius={70}
                    paddingAngle={4} dataKey="value"
                  >
                    {payPie.map((e, i) => <Cell key={i} fill={e.fill} />)}
                  </Pie>
                  <Tooltip content={<PieTip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-3 space-y-2">
                {payPie.map((p, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.fill }} />
                      <span className="text-gray-600 capitalize">{p.name}</span>
                    </div>
                    <span className="font-bold text-gray-700">Rs. {p.value?.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-gray-300">
              <MdPayments className="text-5xl mb-3" />
              <p className="text-sm text-gray-400">No payments in this period</p>
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════
          LINE CHART (trend)
      ══════════════════════════════════════ */}
      {barData.length > 1 && (
        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-gray-800 text-sm sm:text-base">Revenue Trend</h2>
              <p className="text-xs text-gray-400 mt-0.5">Growth — {filterLabel}</p>
            </div>
            <span className="flex items-center gap-1.5 text-xs bg-emerald-50 text-emerald-600 font-semibold px-2.5 py-1.5 rounded-full">
              <FiTrendingUp /> Trend
            </span>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={barData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                axisLine={false} tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                axisLine={false} tickLine={false}
                tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
                width={35}
              />
              <Tooltip content={<BarTip />} />
              <Line
                type="monotone" dataKey="Revenue"
                stroke="#22c55e" strokeWidth={2.5}
                dot={{ fill: "#22c55e", r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ══════════════════════════════════════
          RECENT SALES TABLE (mobile cards + desktop table)
      ══════════════════════════════════════ */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-50 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-gray-800 text-sm sm:text-base">Recent Sales</h2>
            <p className="text-xs text-gray-400 mt-0.5">Latest 5 — {filterLabel}</p>
          </div>
          <span className="text-xs text-indigo-600 font-bold bg-indigo-50 px-2.5 py-1.5 rounded-full">
            {recentSales.length}
          </span>
        </div>

        {/* Mobile Cards */}
        <div className="sm:hidden divide-y divide-gray-50">
          {recentSales.length > 0 ? recentSales.map((sale) => (
            <div key={sale._id} className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-indigo-600 text-xs">{sale.invoiceNumber}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${statusBg(sale.status)}`}>
                  {sale.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700 text-sm font-medium">{sale.customer}</span>
                <span className="font-bold text-gray-800">Rs. {sale.total?.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>{sale.cashier?.name || "—"}</span>
                <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                  <BsCheckCircleFill /> Paid · {sale.paymentMethod}
                </span>
              </div>
            </div>
          )) : (
            <div className="text-center py-10 text-gray-300">
              <FiShoppingCart className="text-4xl mx-auto mb-2" />
              <p className="text-sm text-gray-400">No sales in this period</p>
            </div>
          )}
        </div>

        {/* Desktop Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-400 text-xs uppercase tracking-wider text-left">
                <th className="px-6 py-3">Reference</th>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Cashier</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Total</th>
                <th className="px-6 py-3">Payment</th>
                <th className="px-6 py-3">Paid</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentSales.length > 0 ? recentSales.map((sale) => (
                <tr key={sale._id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-3.5 font-bold text-indigo-600 text-xs">{sale.invoiceNumber}</td>
                  <td className="px-6 py-3.5 text-gray-700">{sale.customer}</td>
                  <td className="px-6 py-3.5 text-gray-500 text-xs">{sale.cashier?.name || "—"}</td>
                  <td className="px-6 py-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusBg(sale.status)}`}>
                      {sale.status}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 font-bold text-gray-800">Rs. {sale.total?.toLocaleString()}</td>
                  <td className="px-6 py-3.5 text-gray-500 capitalize text-xs">{sale.paymentMethod}</td>
                  <td className="px-6 py-3.5">
                    <span className="flex items-center gap-1.5 text-emerald-600 text-xs font-semibold">
                      <BsCheckCircleFill /> Paid
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-gray-300">
                    <FiShoppingCart className="text-4xl mx-auto mb-2" />
                    <p className="text-sm text-gray-400">No sales in this period</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ══════════════════════════════════════
          STOCK ALERT TABLE (mobile cards + desktop table)
      ══════════════════════════════════════ */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center">
              <FiAlertTriangle className="text-orange-500 text-sm" />
            </div>
            <div>
              <h2 className="font-bold text-gray-800 text-sm sm:text-base">Stock Alert</h2>
              <p className="text-xs text-gray-400 mt-0.5">Below minimum stock</p>
            </div>
          </div>
          {lowStockProducts.length > 0 ? (
            <span className="text-xs bg-red-100 text-red-600 font-bold px-2.5 py-1.5 rounded-full">
              ⚠️ {lowStockProducts.length}
            </span>
          ) : (
            <span className="text-xs bg-emerald-100 text-emerald-600 font-bold px-2.5 py-1.5 rounded-full">
              ✅ Good
            </span>
          )}
        </div>

        {/* Mobile Cards */}
        <div className="sm:hidden divide-y divide-gray-50">
          {lowStockProducts.length > 0 ? lowStockProducts.map((p) => (
            <div key={p._id} className="p-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-gray-800 text-sm truncate">{p.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{p.category?.name} · {p.sku}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${p.stock === 0 ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"}`}>
                  {p.stock} {p.unit}
                </span>
                <span className="text-xs text-gray-400">Min: {p.minStock}</span>
              </div>
            </div>
          )) : (
            <div className="text-center py-10 text-gray-300">
              <RiStockLine className="text-4xl mx-auto mb-2" />
              <p className="text-sm text-gray-400">All stock levels are good ✅</p>
            </div>
          )}
        </div>

        {/* Desktop Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-400 text-xs uppercase tracking-wider text-left">
                <th className="px-6 py-3">SKU</th>
                <th className="px-6 py-3">Product</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Stock</th>
                <th className="px-6 py-3">Min Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {lowStockProducts.length > 0 ? lowStockProducts.map((p) => (
                <tr key={p._id} className="hover:bg-orange-50 transition">
                  <td className="px-6 py-3.5 font-mono text-xs text-gray-400">{p.sku}</td>
                  <td className="px-6 py-3.5 font-semibold text-gray-700">{p.name}</td>
                  <td className="px-6 py-3.5 text-gray-500">{p.category?.name || "—"}</td>
                  <td className="px-6 py-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${p.stock === 0 ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"}`}>
                      {p.stock} {p.unit}
                    </span>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-500">
                      {p.minStock} {p.unit}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="text-center py-10 text-gray-300">
                    <RiStockLine className="text-4xl mx-auto mb-2" />
                    <p className="text-sm text-gray-400">All products sufficient ✅</p>
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

export default Dashboard;