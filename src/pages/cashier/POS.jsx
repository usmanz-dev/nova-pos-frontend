import { useEffect, useState } from "react";
import API from "../../api/axios";
import { FaSearch, FaBoxOpen, FaShoppingCart, FaTrash, FaTimes, FaPlus, FaMinus, FaPrint } from "react-icons/fa";
import { FiLoader, FiChevronUp } from "react-icons/fi";
import { MdPayment, MdReceiptLong } from "react-icons/md";
import { HiSparkles } from "react-icons/hi2";
import { BsGrid3X3GapFill } from "react-icons/bs";

/* ─── Thin gray-800 scrollbar — vertical & horizontal ─── */
const scrollbarStyle = `
  .custom-scroll::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  .custom-scroll::-webkit-scrollbar-thumb {
    background-color: #1f2937;
    border-radius: 20px;
  }
  .custom-scroll::-webkit-scrollbar-track {
    background: transparent;
  }
`;

/* ─── Web Audio API — click/pop sound ─── */
const playAddSound = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(880, ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.08);
    gain1.gain.setValueAtTime(0.25, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.12);
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(1100, ctx.currentTime + 0.06);
    osc2.frequency.exponentialRampToValueAtTime(1400, ctx.currentTime + 0.14);
    gain2.gain.setValueAtTime(0.15, ctx.currentTime + 0.06);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
    osc2.start(ctx.currentTime + 0.06);
    osc2.stop(ctx.currentTime + 0.18);
    setTimeout(() => ctx.close(), 500);
  } catch (e) {}
};

/* ─── Receipt Print Function ─── */
const printReceipt = (sale, items, subtotal, taxAmount, discountAmount, total, paymentMethod, customer) => {
  const receiptWindow = window.open("", "_blank", "width=400,height=700");
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "numeric" });
  const timeStr = now.toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit", hour12: true });

  const itemRows = items.map((item) => `
    <tr>
      <td style="padding: 5px 0; font-size: 12px; color: #1f2937; vertical-align: top; max-width: 140px; word-break: break-word;">${item.name}</td>
      <td style="padding: 5px 0; font-size: 12px; color: #374151; text-align: center; white-space: nowrap;">${item.quantity} × ${Number(item.price).toLocaleString()}</td>
      <td style="padding: 5px 0; font-size: 12px; color: #1f2937; text-align: right; font-weight: 700; white-space: nowrap;">Rs. ${Number(item.total).toLocaleString()}</td>
    </tr>
  `).join("");

  receiptWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8" />
      <title>Receipt - ${sale?.invoiceNumber || ""}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;700&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'IBM Plex Mono', 'Courier New', monospace; background: #f3f4f6; display: flex; justify-content: center; padding: 24px 12px; }
        .receipt { background: #fff; width: 320px; padding: 28px 24px 20px; box-shadow: 0 4px 24px rgba(0,0,0,0.10); position: relative; }
        .receipt::before { content: ''; position: absolute; top: -10px; left: 0; right: 0; height: 10px; background: linear-gradient(135deg, #fff 25%, transparent 25%) -10px 0, linear-gradient(225deg, #fff 25%, transparent 25%) -10px 0, linear-gradient(315deg, #fff 25%, transparent 25%), linear-gradient( 45deg, #fff 25%, transparent 25%); background-size: 20px 10px; background-color: #f3f4f6; }
        .receipt::after { content: ''; position: absolute; bottom: -10px; left: 0; right: 0; height: 10px; background: linear-gradient(135deg, transparent 25%, #fff 25%) -10px 0, linear-gradient(225deg, transparent 25%, #fff 25%) -10px 0, linear-gradient(315deg, transparent 25%, #fff 25%), linear-gradient( 45deg, transparent 25%, #fff 25%); background-size: 20px 10px; background-color: #f3f4f6; }
        .header { text-align: center; padding-bottom: 16px; border-bottom: 2px dashed #d1d5db; margin-bottom: 14px; }
        .store-name { font-size: 22px; font-weight: 700; letter-spacing: 3px; color: #1f2937; text-transform: uppercase; }
        .store-tagline { font-size: 10px; color: #9ca3af; letter-spacing: 1.5px; margin-top: 2px; text-transform: uppercase; }
        .meta { margin-bottom: 14px; border-bottom: 1px dashed #e5e7eb; padding-bottom: 12px; }
        .meta-row { display: flex; justify-content: space-between; font-size: 10.5px; color: #6b7280; margin-bottom: 3px; }
        .meta-row span:last-child { color: #1f2937; font-weight: 500; }
        .items-header { display: grid; grid-template-columns: 1fr auto auto; gap: 8px; font-size: 9.5px; font-weight: 700; color: #9ca3af; letter-spacing: 1px; text-transform: uppercase; padding-bottom: 6px; border-bottom: 1px solid #e5e7eb; margin-bottom: 4px; }
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
        .totals { border-top: 2px dashed #d1d5db; padding-top: 10px; margin-bottom: 14px; }
        .total-row { display: flex; justify-content: space-between; font-size: 11px; color: #6b7280; margin-bottom: 5px; }
        .total-row.grand { font-size: 15px; font-weight: 700; color: #1f2937; margin-top: 8px; padding-top: 8px; border-top: 2px solid #1f2937; }
        .payment-badge { display: inline-block; background: #f3f4f6; border: 1px solid #e5e7eb; color: #374151; font-size: 10px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; padding: 4px 10px; border-radius: 4px; margin-bottom: 16px; }
        .footer { text-align: center; border-top: 1px dashed #e5e7eb; padding-top: 14px; }
        .thank-you { font-size: 13px; font-weight: 700; color: #1f2937; letter-spacing: 1px; margin-bottom: 4px; }
        .footer-note { font-size: 9.5px; color: #9ca3af; letter-spacing: 0.5px; }
        .barcode-placeholder { margin: 12px auto 4px; width: 160px; height: 32px; background: repeating-linear-gradient(90deg, #1f2937 0px, #1f2937 2px, transparent 2px, transparent 5px, #1f2937 5px, #1f2937 6px, transparent 6px, transparent 9px, #1f2937 9px, #1f2937 12px, transparent 12px, transparent 14px, #1f2937 14px, #1f2937 15px, transparent 15px, transparent 18px, #1f2937 18px, #1f2937 20px, transparent 20px, transparent 22px, #1f2937 22px, #1f2937 24px, transparent 24px, transparent 27px, #1f2937 27px, #1f2937 28px, transparent 28px, transparent 31px, #1f2937 31px, #1f2937 34px, transparent 34px, transparent 36px, #1f2937 36px, #1f2937 37px, transparent 37px, transparent 40px); border-radius: 2px; }
        @media print { body { background: white; padding: 0; } .receipt { box-shadow: none; width: 100%; max-width: 320px; } .no-print { display: none; } }
      </style>
    </head>
    <body>
      <div class="receipt">
        <div class="header">
          <div class="store-name">NOVA POS</div>
          <div class="store-tagline">Point of Sale System</div>
        </div>
        <div class="meta">
          <div class="meta-row"><span>Invoice</span><span>${sale?.invoiceNumber || "—"}</span></div>
          <div class="meta-row"><span>Date</span><span>${dateStr}</span></div>
          <div class="meta-row"><span>Time</span><span>${timeStr}</span></div>
          <div class="meta-row"><span>Customer</span><span>${customer || "Walk-in Customer"}</span></div>
          <div class="meta-row"><span>Cashier</span><span>${sale?.cashier?.name || "Staff"}</span></div>
        </div>
        <div class="items-header"><span>Item</span><span style="text-align:center">Qty × Price</span><span style="text-align:right">Total</span></div>
        <table class="items-table"><tbody>${itemRows}</tbody></table>
        <div class="totals">
          <div class="total-row"><span>Subtotal</span><span>Rs. ${Number(subtotal).toLocaleString()}</span></div>
          ${taxAmount > 0 ? `<div class="total-row"><span>Tax</span><span>Rs. ${Number(taxAmount).toLocaleString()}</span></div>` : ""}
          ${discountAmount > 0 ? `<div class="total-row"><span>Discount</span><span>- Rs. ${Number(discountAmount).toLocaleString()}</span></div>` : ""}
          <div class="total-row grand"><span>TOTAL</span><span>Rs. ${Number(total).toLocaleString()}</span></div>
        </div>
        <div style="text-align:center; margin-bottom: 14px;"><span class="payment-badge">Paid via ${(paymentMethod || "cash").toUpperCase()}</span></div>
        <div style="text-align:center;">
          <div class="barcode-placeholder"></div>
          <div style="font-size:9px; color:#9ca3af; margin-top:4px; letter-spacing:2px;">${sale?.invoiceNumber || "NOVA-POS"}</div>
        </div>
        <div class="footer">
          <div class="thank-you">★ THANK YOU ★</div>
          <div class="footer-note">Please come again • Nova POS</div>
          <div class="footer-note" style="margin-top:3px;">Powered by Nova POS System</div>
        </div>
      </div>
      <script>window.onload = function() { setTimeout(function() { window.print(); }, 300); };</script>
    </body>
    </html>
  `);
  receiptWindow.document.close();
};

const POS = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [customer, setCustomer] = useState("Walk-in Customer");
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  const [placing, setPlacing] = useState(false);
  const [successSale, setSuccessSale] = useState(null);
  const [showCart, setShowCart] = useState(false);
  const [lastSaleItems, setLastSaleItems] = useState([]);
  const [lastSaleTotals, setLastSaleTotals] = useState({});

  // ── Variant popup ──
  const [variantProduct, setVariantProduct] = useState(null);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await API.get("/products");
      setProducts(data.data.filter((p) => p.isActive && p.stock > 0));
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

  // ── Product click: show variant popup OR add directly ──
  const handleProductClick = (product) => {
    if (product.variants && product.variants.length > 0) {
      setVariantProduct(product);
    } else {
      addToCart(product, null);
    }
  };

  // ── Add to cart — supports variants ──
  const addToCart = (product, variant) => {
    playAddSound();
    const cartKey = variant ? `${product._id}_${variant._id}` : product._id;
    const itemName = variant ? `${product.name} (${variant.name})` : product.name;
    const itemPrice = variant ? variant.price : product.price;
    const itemStock = variant ? variant.stock : product.stock;

    const exists = cart.find((item) => item.cartKey === cartKey);
    if (exists) {
      if (exists.quantity >= itemStock) {
        alert(`Only ${itemStock} ${product.unit} available!`);
        return;
      }
      setCart(cart.map((item) =>
        item.cartKey === cartKey
          ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
          : item
      ));
    } else {
      setCart([...cart, {
        cartKey,
        product: product._id,
        variantId: variant?._id || null,
        name: itemName,
        price: itemPrice,
        quantity: 1,
        total: itemPrice,
        stock: itemStock,
        unit: product.unit,
        image: product.image,
      }]);
    }
    setVariantProduct(null);
  };

  const removeFromCart = (cartKey) => {
    setCart(cart.filter((item) => item.cartKey !== cartKey));
  };

  const updateQty = (cartKey, qty) => {
    if (qty < 1) { removeFromCart(cartKey); return; }
    const item = cart.find((i) => i.cartKey === cartKey);
    if (qty > item.stock) { alert(`Only ${item.stock} ${item.unit} available!`); return; }
    setCart(cart.map((item) =>
      item.cartKey === cartKey
        ? { ...item, quantity: qty, total: qty * item.price }
        : item
    ));
  };

  const clearCart = () => {
    if (cart.length === 0) return;
    if (window.confirm("Clear all items?")) setCart([]);
  };

  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const taxAmount = Math.round((subtotal * tax) / 100);
  const discountAmount = Math.round((subtotal * discount) / 100);
  const total = subtotal + taxAmount - discountAmount;
  const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    setPlacing(true);
    const saleItems = [...cart];
    const saleTotals = { subtotal, taxAmount, discountAmount, total, tax, discount };
    try {
      const { data } = await API.post("/sales", {
        customer,
        items: cart.map((item) => ({
          product: item.product,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          total: item.total,
        })),
        subtotal, tax: taxAmount, discount: discountAmount, total, paymentMethod,
      });
      setLastSaleItems(saleItems);
      setLastSaleTotals(saleTotals);
      setSuccessSale({ ...data.data, customer, paymentMethod });
      setCart([]);
      setShowPayment(false);
      setShowCart(false);
      setCustomer("Walk-in Customer");
      setDiscount(0);
      setTax(0);
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || "Order failed");
    } finally {
      setPlacing(false);
    }
  };

  const filtered = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCategory ? p.category?._id === filterCategory : true;
    return matchSearch && matchCat;
  });

  // ─── Cart Panel ───
  const CartPanel = ({ onClose }) => (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3.5 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center">
            <FaShoppingCart className="text-white text-xs" />
          </div>
          <div>
            <h2 className="font-bold text-gray-800 text-sm">Order Cart</h2>
            <p className="text-xs text-gray-400">{totalQty} items</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {cart.length > 0 && (
            <button onClick={clearCart} className="text-xs text-red-400 hover:text-red-600 font-semibold bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg transition flex items-center gap-1">
              <FaTrash className="text-xs" /> Clear
            </button>
          )}
          {onClose && (
            <button onClick={onClose} className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition">
              <FaTimes className="text-xs" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scroll p-3 space-y-2">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-3">
              <FaShoppingCart className="text-2xl text-gray-300" />
            </div>
            <p className="text-sm font-semibold text-gray-400">Cart is empty</p>
            <p className="text-xs text-gray-300 mt-1">Tap products to add them</p>
          </div>
        ) : (
          cart.map((item) => (
            <div key={item.cartKey} className="flex items-center gap-2.5 bg-gray-50 hover:bg-gray-100 rounded-2xl p-2.5 transition group">
              <img src={item.image || "https://via.placeholder.com/40"} alt={item.name} className="w-10 h-10 rounded-xl object-cover shadow-sm" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-800 truncate leading-tight">{item.name}</p>
                <p className="text-xs text-indigo-600 font-semibold mt-0.5">Rs. {item.price?.toLocaleString()} × {item.quantity}</p>
                <p className="text-xs font-bold text-gray-700">= Rs. {item.total?.toLocaleString()}</p>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-1 bg-white rounded-xl shadow-sm border border-gray-100 px-1 py-0.5">
                  <button onClick={() => updateQty(item.cartKey, item.quantity - 1)} className="w-6 h-6 rounded-lg bg-gray-100 hover:bg-red-100 hover:text-red-600 text-gray-600 font-bold text-xs flex items-center justify-center transition">
                    <FaMinus className="text-[10px]" />
                  </button>
                  <span className="w-5 text-center text-xs font-extrabold text-gray-800">{item.quantity}</span>
                  <button onClick={() => updateQty(item.cartKey, item.quantity + 1)} className="w-6 h-6 rounded-lg bg-indigo-50 hover:bg-indigo-200 text-indigo-600 font-bold text-xs flex items-center justify-center transition">
                    <FaPlus className="text-[10px]" />
                  </button>
                </div>
                <button onClick={() => removeFromCart(item.cartKey)} className="text-gray-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100">
                  <FaTimes className="text-xs" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {cart.length > 0 && (
        <div className="p-3 border-t border-gray-100 space-y-3 bg-white">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-400 mb-1 block font-medium">Tax (%)</label>
              <input type="number" value={tax} onChange={(e) => setTax(Number(e.target.value))} min="0" max="100" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block font-medium">Discount (%)</label>
              <input type="number" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} min="0" max="100" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50" />
            </div>
          </div>
          <div className="bg-indigo-50 rounded-2xl p-3.5 space-y-1.5 border border-indigo-100">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Subtotal</span><span className="font-semibold">Rs. {subtotal.toLocaleString()}</span>
            </div>
            {tax > 0 && (
              <div className="flex justify-between text-xs text-gray-500">
                <span>Tax ({tax}%)</span><span className="font-semibold text-orange-500">+ Rs. {taxAmount.toLocaleString()}</span>
              </div>
            )}
            {discount > 0 && (
              <div className="flex justify-between text-xs text-gray-500">
                <span>Discount ({discount}%)</span><span className="font-semibold text-emerald-500">− Rs. {discountAmount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between font-extrabold text-gray-800 text-base pt-1.5 border-t border-indigo-200 mt-1">
              <span>Total</span><span className="text-indigo-600">Rs. {total.toLocaleString()}</span>
            </div>
          </div>
          <button onClick={() => setShowPayment(true)} className="w-full bg-gray-900 hover:bg-indigo-700 text-white py-3 rounded-2xl font-bold text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-gray-900/20">
            <MdPayment className="text-lg" />
            Proceed to Payment
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      <style>{scrollbarStyle}</style>
      <div className="flex flex-col h-[calc(100vh-64px)] sm:h-[calc(100vh-80px)]">

        {/* ── MOBILE BOTTOM BAR ── */}
        {cart.length > 0 && (
          <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40">
            <div className="bg-white border-t border-gray-100 shadow-2xl shadow-black/20">
              <div className="px-3 pt-2.5 pb-1 overflow-x-auto flex gap-2 scrollbar-hide">
                {cart.map((item) => (
                  <div key={item.cartKey} className="flex flex-col items-center relative">
                    <div className="relative">
                      <img src={item.image || "https://via.placeholder.com/48"} alt={item.name} className="w-12 h-12 rounded-xl object-cover border-2 border-indigo-100 shadow-sm" />
                      <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-indigo-600 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center shadow">{item.quantity}</span>
                      <button onClick={() => removeFromCart(item.cartKey)} className="absolute -bottom-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center shadow">
                        <FaTimes className="text-[8px]" />
                      </button>
                    </div>
                    <p className="text-[10px] text-gray-500 font-medium mt-1.5 max-w-[48px] truncate text-center">{item.name}</p>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-3 px-3 py-2.5">
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xs text-gray-400 font-medium">{totalQty} items</span>
                    <span className="text-gray-300">·</span>
                    <span className="text-base font-extrabold text-gray-800">Rs. {total.toLocaleString()}</span>
                  </div>
                  {(tax > 0 || discount > 0) && (
                    <p className="text-[10px] text-gray-400">
                      {tax > 0 && `Tax ${tax}%`}{tax > 0 && discount > 0 && " · "}{discount > 0 && `Disc ${discount}%`}
                    </p>
                  )}
                </div>
                <button onClick={() => setShowCart(true)} className="flex items-center gap-2 bg-gray-800 hover:bg-indigo-700 active:scale-95 text-white px-4 py-2.5 rounded-2xl font-bold text-sm transition shadow-lg shadow-indigo-500/30">
                  <MdReceiptLong className="text-base" />
                  View Cart
                  <FiChevronUp className="text-sm" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── MAIN LAYOUT ── */}
        <div className="flex gap-4 flex-1 overflow-hidden">

          {/* LEFT: Products */}
          <div className={`flex-1 flex flex-col gap-3 overflow-hidden ${cart.length > 0 ? "pb-96 lg:pb-0" : "pb-0"}`}>
            <div className="bg-white rounded-2xl p-3 shadow-sm space-y-2.5">
              <div className="relative">
                <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 text-sm pointer-events-none" />
                <input
                  type="text" placeholder="Search by name or SKU..."
                  value={search} onChange={(e) => setSearch(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50 placeholder:text-gray-300 font-medium transition"
                />
                {search && (
                  <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
                    <FaTimes className="text-xs" />
                  </button>
                )}
              </div>
              <div className="flex gap-2 overflow-x-auto custom-scroll pb-1.5">
                <button onClick={() => setFilterCategory("")} className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${filterCategory === "" ? "bg-gray-900 text-white shadow-md" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>All</button>
                {categories.map((cat) => (
                  <button key={cat._id} onClick={() => setFilterCategory(cat._id)} className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${filterCategory === cat._id ? "bg-gray-900 text-white shadow-md" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>{cat.name}</button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scroll rounded-xl">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                  <FiLoader className="text-3xl mb-2 animate-spin text-indigo-400" />
                  <p className="text-sm">Loading products...</p>
                </div>
              ) : filtered.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5">
                  {filtered.map((product) => {
                    const hasVariants = product.variants && product.variants.length > 0;
                    const cartCount = cart.filter((i) => i.product === product._id).reduce((s, i) => s + i.quantity, 0);
                    return (
                      <button
                        key={product._id}
                        onClick={() => handleProductClick(product)}
                        className={`relative bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md active:scale-[0.97] transition-all text-left group ${cartCount > 0 ? "ring-2 ring-indigo-500 ring-offset-1" : ""}`}
                      >
                        {cartCount > 0 && (
                          <div className="absolute top-2 right-2 z-10 w-6 h-6 bg-indigo-600 text-white text-xs font-extrabold rounded-full flex items-center justify-center shadow-md">
                            {cartCount}
                          </div>
                        )}
                        {hasVariants && (
                          <div className="absolute top-2 left-2 z-10 flex items-center gap-1 bg-black/60 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-lg backdrop-blur-sm">
                            <BsGrid3X3GapFill className="text-[9px]" />
                            {product.variants.length}
                          </div>
                        )}
                        <div className="relative overflow-hidden">
                          <img src={product.image || "https://via.placeholder.com/200"} alt={product.name} className="w-full h-24 sm:h-28 object-cover group-hover:scale-105 transition-transform duration-300" />
                          <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity" />
                        </div>
                        <div className="p-2.5">
                          <p className="font-bold text-gray-800 text-xs leading-tight line-clamp-2 mb-1">{product.name}</p>
                          <p className="text-indigo-600 font-extrabold text-sm">
                            {hasVariants
                              ? `From Rs. ${Math.min(...product.variants.map(v => v.price)).toLocaleString()}`
                              : `Rs. ${product.price?.toLocaleString()}`
                            }
                          </p>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-[10px] text-gray-400 font-medium">{product.stock} {product.unit}</p>
                            <div className={`w-5 h-5 rounded-lg flex items-center justify-center transition ${cartCount > 0 ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-400 group-hover:bg-indigo-100 group-hover:text-indigo-600"}`}>
                              {hasVariants ? <BsGrid3X3GapFill className="text-[9px]" /> : <FaPlus className="text-[9px]" />}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                  <FaBoxOpen className="text-4xl mb-2 text-gray-300" />
                  <p className="text-sm font-semibold">No products found</p>
                  <p className="text-xs text-gray-300 mt-1">Try a different search</p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Cart Desktop */}
          <div className="hidden lg:flex w-80 xl:w-96">
            <div className="w-full bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col">
              <CartPanel />
            </div>
          </div>
        </div>

        {/* ── MOBILE CART DRAWER ── */}
        {showCart && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowCart(false)} />
            <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[90vh] flex flex-col shadow-2xl">
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 bg-gray-200 rounded-full" />
              </div>
              <div className="flex-1 overflow-hidden">
                <CartPanel onClose={() => setShowCart(false)} />
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════
            VARIANT SELECT POPUP
        ══════════════════════════════════════ */}
        {variantProduct && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
            <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-sm">

              {/* Handle — mobile */}
              <div className="flex justify-center pt-3 pb-0 sm:hidden">
                <div className="w-10 h-1 bg-gray-200 rounded-full" />
              </div>

              {/* Header */}
              <div className="px-5 pt-4 pb-3 flex items-center gap-3">
                <img src={variantProduct.image || "https://via.placeholder.com/48"} alt={variantProduct.name} className="w-12 h-12 rounded-xl object-cover shadow-sm flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h2 className="text-sm font-extrabold text-gray-800 leading-tight">{variantProduct.name}</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Select a variant to add to cart</p>
                </div>
                <button onClick={() => setVariantProduct(null)} className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition flex-shrink-0">
                  <FaTimes className="text-xs" />
                </button>
              </div>

              {/* Variants */}
              <div className="px-4 pb-6 space-y-2 max-h-72 overflow-y-auto custom-scroll">
                {variantProduct.variants.map((variant) => {
                  const cartKey = `${variantProduct._id}_${variant._id}`;
                  const inCart = cart.find((i) => i.cartKey === cartKey);
                  const outOfStock = variant.stock <= 0;
                  return (
                    <button
                      key={variant._id}
                      onClick={() => !outOfStock && addToCart(variantProduct, variant)}
                      disabled={outOfStock}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl border-2 transition active:scale-[0.98] ${
                        outOfStock
                          ? "border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed"
                          : inCart
                          ? "border-indigo-500 bg-indigo-50"
                          : "border-gray-100 bg-gray-50 hover:border-indigo-300 hover:bg-indigo-50"
                      }`}
                    >
                      <div className="text-left">
                        <p className="text-sm font-bold text-gray-800">{variant.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {outOfStock ? "Out of stock" : `${variant.stock} available`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-extrabold text-indigo-600">Rs. {variant.price?.toLocaleString()}</span>
                        {inCart ? (
                          <div className="w-7 h-7 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-xs font-extrabold shadow">
                            {inCart.quantity}
                          </div>
                        ) : (
                          <div className="w-7 h-7 bg-gray-200 rounded-xl flex items-center justify-center text-gray-500">
                            <FaPlus className="text-[10px]" />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── PAYMENT MODAL ── */}
        {showPayment && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
            <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-sm">
              <div className="flex justify-center pt-3 pb-0 sm:hidden">
                <div className="w-10 h-1 bg-gray-200 rounded-full" />
              </div>
              <div className="px-5 pt-4 pb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center">
                    <MdPayment className="text-white text-lg" />
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-gray-800">Payment</h2>
                    <p className="text-xs text-gray-400">{cart.length} items · Rs. {total.toLocaleString()}</p>
                  </div>
                </div>
                <button onClick={() => setShowPayment(false)} className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition">
                  <FaTimes className="text-xs" />
                </button>
              </div>
              <div className="px-5 pb-6 pt-3 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Customer Name</label>
                  <input type="text" value={customer} onChange={(e) => setCustomer(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">Payment Method</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { key: "cash", icon: "💵", label: "Cash" },
                      // { key: "card", icon: "💳", label: "Card" },
                      // { key: "online", icon: "📱", label: "Online" },
                      // { key: "other", icon: "🔄", label: "Other" },
                    ].map((m) => (
                      <button key={m.key} onClick={() => setPaymentMethod(m.key)} className={`py-2.5 rounded-xl text-xs font-bold transition flex flex-col items-center gap-0.5 ${paymentMethod === m.key ? "bg-gray-800 text-white shadow-lg shadow-indigo-200" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                        <span className="text-base">{m.icon}</span>
                        <span>{m.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="bg-indigo-50 rounded-2xl p-4 space-y-2 border border-indigo-100">
                  <div className="flex justify-between text-xs text-gray-500"><span>Subtotal</span><span className="font-semibold">Rs. {subtotal.toLocaleString()}</span></div>
                  <div className="flex justify-between text-xs text-gray-500"><span>Tax ({tax}%)</span><span className="font-semibold">Rs. {taxAmount.toLocaleString()}</span></div>
                  <div className="flex justify-between text-xs text-gray-500"><span>Discount ({discount}%)</span><span className="font-semibold text-indigo-600">Rs. {discountAmount.toLocaleString()}</span></div>
                  <div className="flex justify-between font-extrabold text-gray-800 text-lg border-t border-indigo-200 pt-2.5 mt-1"><span>Total</span><span className="text-indigo-600">Rs. {total.toLocaleString()}</span></div>
                </div>
                <button onClick={handlePlaceOrder} disabled={placing} className="w-full bg-gray-800 hover:bg-indigo-700 active:scale-[0.98] text-white py-3.5 rounded-2xl font-extrabold text-sm transition disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg shadow-indigo-200">
                  {placing ? <><FiLoader className="animate-spin text-base" /> Processing...</> : <><HiSparkles className="text-base" /> Place Order</>}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── SUCCESS MODAL ── */}
        {successSale && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xs mx-auto text-center overflow-hidden">
              <div className="bg-indigo-600 px-6 pt-8 pb-6">
                <div className="text-5xl mb-2">🎉</div>
                <h2 className="text-xl font-extrabold text-white mb-0.5">Sale Complete!</h2>
                <p className="text-indigo-100 text-xs font-medium">{successSale.invoiceNumber}</p>
              </div>
              <div className="p-5 space-y-3">
                <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4">
                  <p className="text-3xl font-extrabold text-indigo-600">Rs. {successSale.total?.toLocaleString()}</p>
                  <p className="text-xs text-gray-400 mt-1 capitalize">via {successSale.paymentMethod}</p>
                </div>
                <button
                  onClick={() => printReceipt(successSale, lastSaleItems, lastSaleTotals.subtotal, lastSaleTotals.taxAmount, lastSaleTotals.discountAmount, lastSaleTotals.total, successSale.paymentMethod, successSale.customer)}
                  className="w-full bg-gray-800 hover:bg-gray-900 cursor-pointer active:scale-[0.98] text-white py-3 rounded-2xl font-extrabold text-sm transition flex items-center justify-center gap-2 shadow-md"
                >
                  <FaPrint className="text-sm" /> Print Receipt
                </button>
                <button onClick={() => setSuccessSale(null)} className="w-full bg-indigo-600 hover:bg-indigo-700 cursor-pointer active:scale-[0.98] text-white py-3 rounded-2xl font-extrabold text-sm transition shadow-lg shadow-indigo-200">
                  New Sale
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
};

export default POS;