const RolesPermissions = () => {
  const roles = [
    {
      name: "Admin",
      icon: "👑",
      color: "bg-indigo-50 border-indigo-200",
      badge: "bg-indigo-100 text-indigo-700",
      permissions: [
        "Full system access",
        "Manage users & roles",
        "View all reports",
        "Manage products & inventory",
        "Manage sales & purchases",
        "Manage expenses",
        "System settings",
      ],
    },
    {
      name: "Cashier",
      icon: "🧾",
      color: "bg-emerald-50 border-emerald-200",
      badge: "bg-emerald-100 text-emerald-700",
      permissions: [
        "Access POS screen",
        "Create sales",
        "View own sales history",
        "Update own profile",
      ],
    },
    {
      name: "Inventory Manager",
      icon: "📦",
      color: "bg-orange-50 border-orange-200",
      badge: "bg-orange-100 text-orange-700",
      permissions: [
        "View all products",
        "Add & edit products",
        "Stock adjustments",
        "View inventory dashboard",
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800">Roles & Permissions</h1>
        <p className="text-sm text-gray-400 mt-1">
          View system roles and their permissions
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {roles.map((role) => (
          <div
            key={role.name}
            className={`rounded-2xl border p-5 ${role.color}`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="text-3xl">{role.icon}</div>
              <div>
                <p className="font-bold text-gray-800">{role.name}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${role.badge}`}>
                  {role.permissions.length} permissions
                </span>
              </div>
            </div>
            <ul className="space-y-2">
              {role.permissions.map((perm) => (
                <li key={perm} className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="text-emerald-500 font-bold">✓</span>
                  {perm}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RolesPermissions;