import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import icon from "../../assets/icon.png";
import sideImage from "../../assets/bg-img.webp";

const roles = [
  {
    label: "Admin",
    email: "admin@pos.com",
    password: "admin123",
    color: "bg-indigo-600 hover:bg-indigo-700",
  },
  {
    label: "Cashier",
    email: "cashier@pos.com",
    password: "cashier123",
    color: "bg-emerald-600 hover:bg-emerald-700",
  },
  {
    label: "Inventory Manager",
    email: "inventory@pos.com",
    password: "inventory123",
    color: "bg-orange-500 hover:bg-orange-600",
  },
];

const Login = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRoleClick = (role) => {
    setEmail(role.email);
    setPassword(role.password);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Image Section */}
      <div
        className="hidden md:flex flex-1 bg-cover bg-center"
        style={{ backgroundImage: `url(${sideImage})` }}
      >

      </div>

      {/* Right Form Section */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 p-8">
        <div className="w-full max-w-md bg-white shadow-2xl rounded-2xl p-8">
          {/* Logo + Header */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2">
              <img src={icon} alt="Nova POS Logo" className="w-10 h-10 object-contain" />
              <h2 className="text-2xl font-bold tracking-wide text-gray-900">NOVA POS</h2>
            </div>
            <p className="text-gray-500 mt-2 text-sm">Sign in to your account</p>
          </div>

          {/* Role Buttons */}
          <div className="mb-6">
            <p className="text-xs text-gray-400 text-center mb-3 uppercase tracking-wider">
              Quick Login — Select Role
            </p>
            <div className="grid grid-cols-3 gap-2">
              {roles.map((role) => (
                <button
                  key={role.label}
                  onClick={() => handleRoleClick(role)}
                  className={`${role.color} text-white rounded-xl py-3 px-2 text-center transition`}
                >
                  <p className="text-sm font-semibold">{role.label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <hr className="flex-1 border-gray-200" />
            <span className="text-xs text-gray-400">or enter manually</span>
            <hr className="flex-1 border-gray-200" />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@pos.com"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-800 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-60"
            >
              {loading ? "Logging in..." : "Sign In"}
            </button>
          </form>

          
        </div>
      </div>
    </div>
  );
};

export default Login;