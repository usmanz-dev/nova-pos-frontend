import { useEffect, useState } from "react";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { FiLoader } from "react-icons/fi";

const Profile = () => {
  const { user, login } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await API.get("/auth/me");
      setForm((prev) => ({
        ...prev,
        name: data.data.name || "",
        phone: data.data.phone || "",
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      await API.put("/auth/profile", {
        name: form.name,
        phone: form.phone,
      });
      setSuccess("Profile updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (form.newPassword !== form.confirmPassword) {
      setError("New passwords do not match!");
      return;
    }
    if (form.newPassword.length < 6) {
      setError("Password must be at least 6 characters!");
      return;
    }

    setSaving(true);
    try {
      await API.put("/auth/profile", {
        currentPassword: form.currentPassword,
        password: form.newPassword,
      });
      setSuccess("Password changed successfully!");
      setForm((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Password change failed");
    } finally {
      setSaving(false);
    }
  };

  const getRoleColor = (role) => {
    if (role === "admin") return "bg-indigo-100 text-indigo-700";
    if (role === "cashier") return "bg-emerald-100 text-emerald-700";
    return "bg-orange-100 text-orange-700";
  };

  const getRoleIcon = (role) => {
    if (role === "admin") return "👑";
    if (role === "cashier") return "🧾";
    return "📦";
  };

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
    <div className="space-y-6 max-w-2xl mx-auto">

      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
        <p className="text-sm text-gray-400 mt-1">
          Manage your account information
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-5">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-2xl bg-indigo-100 flex items-center justify-center text-4xl font-bold text-indigo-600">
            {user?.name?.charAt(0).toUpperCase()}
          </div>

          {/* Info */}
          <div>
            <h2 className="text-xl font-bold text-gray-800">{user?.name}</h2>
            <p className="text-sm text-gray-400">{user?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${getRoleColor(user?.role)}`}>
                {getRoleIcon(user?.role)} {user?.role}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                Active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Success / Error Messages */}
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm font-medium">
          ✅ {success}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium">
          ❌ {error}
        </div>
      )}

      {/* Update Info */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-800">Personal Information</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Update your name and phone number
          </p>
        </div>

        <form onSubmit={handleUpdateInfo} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          {/* Email - readonly */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={user?.email}
              disabled
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
            />
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="03001234567"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto bg-gray-800 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-60"
          >
            {saving ? "Saving..." : "Update Info"}
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-800">Change Password</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Keep your account secure
          </p>
        </div>

        <form onSubmit={handleChangePassword} className="p-6 space-y-4">
          {/* Current Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Password
            </label>
            <input
              type="password"
              value={form.currentPassword}
              onChange={(e) =>
                setForm({ ...form, currentPassword: e.target.value })
              }
              required
              placeholder="••••••••"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              value={form.newPassword}
              onChange={(e) =>
                setForm({ ...form, newPassword: e.target.value })
              }
              required
              placeholder="••••••••"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(e) =>
                setForm({ ...form, confirmPassword: e.target.value })
              }
              required
              placeholder="••••••••"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />

            {/* Password Match Indicator */}
            {form.newPassword && form.confirmPassword && (
              <p className={`text-xs mt-1 ${form.newPassword === form.confirmPassword
                  ? "text-emerald-600"
                  : "text-red-500"
                }`}>
                {form.newPassword === form.confirmPassword
                  ? "✅ Passwords match"
                  : "❌ Passwords do not match"}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-60"
          >
            {saving ? "Changing..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;