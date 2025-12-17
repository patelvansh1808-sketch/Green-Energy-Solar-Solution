export default function DashboardCard({ title, value, icon }) {
  return (
    <div className="card flex justify-between items-center">
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <h2 className="text-2xl font-bold text-primary">{value}</h2>
      </div>
      <span className="text-3xl">{icon}</span>
    </div>
  );
}
