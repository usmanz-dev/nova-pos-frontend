const Templates = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800">Templates</h1>
        <p className="text-sm text-gray-400 mt-1">
          Manage invoice and receipt templates
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { name: "Invoice Template", icon: "🧾", desc: "Standard invoice layout" },
          { name: "Receipt Template", icon: "📄", desc: "POS receipt layout" },
        ].map((t) => (
          <div key={t.name} className="bg-white rounded-2xl shadow-sm p-5 flex items-center gap-4">
            <div className="text-4xl">{t.icon}</div>
            <div className="flex-1">
              <p className="font-bold text-gray-800">{t.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">{t.desc}</p>
            </div>
            <button className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-3 py-1.5 rounded-lg text-xs font-medium transition">
              Edit
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Templates;