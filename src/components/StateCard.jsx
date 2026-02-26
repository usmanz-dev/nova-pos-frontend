const StatCard = ({ title, value, icon, color }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4">
      {/* Icon */}
      <div className={`text-3xl p-3 rounded-full ${color}`}>
        {icon}
      </div>

      {/* Text */}
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
      </div>
    </div>
  );
};

export default StatCard;