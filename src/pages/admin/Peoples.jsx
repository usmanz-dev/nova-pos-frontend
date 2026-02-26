import { useEffect, useState } from "react";
import API from "../../api/axios";
import { FaSearch } from "react-icons/fa";

const Peoples = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "", email: "", password: "",
    role: "cashier", phone: "", isActive: true,
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await API.get("/users");
      setUsers(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditUser(null);
    setForm({
      name: "", email: "", password: "",
      role: "cashier", phone: "", isActive: true,
    });
    setError("");
    setShowModal(true);
  };

  const openEditModal = (user) => {
    setEditUser(user);
    setForm({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      phone: user.phone || "",
      isActive: user.isActive,
    });
    setError("");
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const payload = { ...form };
      if (editUser && !payload.password) delete payload.password;

      if (editUser) {
        await API.put(`/users/${editUser._id}`, payload);
      } else {
        await API.post("/users", payload);
      }
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await API.delete(`/users/${id}`);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  const handleToggleActive = async (user) => {
    try {
      await API.put(`/users/${user._id}`, { isActive: !user.isActive });
      fetchUsers();
    } catch (err) {
      alert("Update failed");
    }
  };

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const getRoleBadge = (role) => {
    if (role === "admin") return "bg-indigo-100 text-indigo-700";
    if (role === "cashier") return "bg-emerald-100 text-emerald-700";
    return "bg-orange-100 text-orange-700";
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Peoples</h1>
          <p className="text-sm text-gray-400 mt-1">
            Manage system users and roles
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="w-full sm:w-auto bg-gray-800 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition"
        >
          + Add User
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-blue-300 rounded-2xl p-4 shadow-sm text-center">
          <p className="text-xs text-black mb-1">Total Users</p>
          <p className="text-2xl font-bold text-black">{users.length}</p>
        </div>
        <div className="bg-yellow-200 rounded-2xl p-4 shadow-sm text-center">
          <p className="text-xs text-black mb-1">Active</p>
          <p className="text-2xl font-bold text-black">
            {users.filter((u) => u.isActive).length}
          </p>
        </div>
        <div className="bg-red-200 rounded-2xl p-4 shadow-sm text-center">
          <p className="text-xs text-black mb-1">Inactive</p>
          <p className="text-2xl font-bold text-black">
            {users.filter((u) => !u.isActive).length}
          </p>
        </div>
      </div>

      {/* Search */}
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

      {/* Mobile Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:hidden gap-4">
        {loading ? (
          <div className="text-center py-10 text-gray-400">Loading...</div>
        ) : filtered.length > 0 ? (
          filtered.map((user) => (
            <div
              key={user._id}
              className="bg-white rounded-2xl shadow-sm p-5 space-y-3"
            >
              {/* Avatar + Info */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-xl font-bold text-indigo-600">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-gray-800">{user.name}</p>
                  <p className="text-xs text-gray-400">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getRoleBadge(user.role)}`}>
                  {user.role}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${user.isActive
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-red-100 text-red-700"
                  }`}>
                  {user.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              {user.phone && (
                <p className="text-xs text-gray-400">📞 {user.phone}</p>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => openEditModal(user)}
                  className="flex-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 py-1.5 rounded-lg text-xs font-medium transition"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleToggleActive(user)}
                  className="flex-1 bg-yellow-50 hover:bg-yellow-100 text-yellow-600 py-1.5 rounded-lg text-xs font-medium transition"
                >
                  {user.isActive ? "Deactivate" : "Activate"}
                </button>
                <button
                  onClick={() => handleDelete(user._id)}
                  className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-1.5 rounded-lg text-xs font-medium transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10 text-gray-400">
            <div className="text-4xl mb-2">👥</div>
            No users found
          </div>
        )}
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider text-left">
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-gray-400">
                    Loading...
                  </td>
                </tr>
              ) : filtered.length > 0 ? (
                filtered.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-600">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <p className="font-semibold text-gray-800">{user.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getRoleBadge(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {user.phone || "—"}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${user.isActive
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-700"
                        }`}>
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-xs">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(user)}
                          className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-3 py-1.5 rounded-lg text-xs font-medium transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleToggleActive(user)}
                          className="bg-yellow-50 hover:bg-yellow-100 text-yellow-600 px-3 py-1.5 rounded-lg text-xs font-medium transition"
                        >
                          {user.isActive ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          onClick={() => handleDelete(user._id)}
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
                  <td colSpan="7" className="text-center py-10 text-gray-400">
                    <div className="text-4xl mb-2">👥</div>
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">

            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl">
              <h2 className="text-lg font-bold text-gray-800">
                {editUser ? "✏️ Edit User" : "➕ Add New User"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  placeholder="John Doe"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  placeholder="john@pos.com"
                  disabled={!!editUser}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:bg-gray-50 disabled:text-gray-400"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password {editUser ? "(Leave blank to keep same)" : "*"}
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required={!editUser}
                  placeholder="••••••••"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role *
                </label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  <option value="cashier">Cashier</option>
                  <option value="inventory">Inventory Manager</option>
                  <option value="admin">Admin</option>
                </select>
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

              {/* Active Toggle */}
              {editUser && (
                <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                  <span className="text-sm font-medium text-gray-700">
                    Account Active
                  </span>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, isActive: !form.isActive })}
                    className={`w-12 h-6 rounded-full transition-colors ${form.isActive ? "bg-indigo-600" : "bg-gray-300"
                      }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform mx-0.5 ${form.isActive ? "translate-x-6" : "translate-x-0"
                      }`} />
                  </button>
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition disabled:opacity-60"
                >
                  {saving ? "Saving..." : editUser ? "Update User" : "Add User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Peoples;