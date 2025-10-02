const StatCard = ({ label, value }) => (
  <div className="rounded bg-white p-4 shadow">
    <p className="text-sm text-gray-500">{label}</p>
    <p className="mt-2 text-2xl font-semibold">{value}</p>
  </div>
);

export default StatCard;
