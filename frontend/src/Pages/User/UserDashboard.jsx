import DashboardCard from "../../Components/DashboardCard";

export default function UserDashboard() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="title">User Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <DashboardCard title="Today's Energy" value="12.4 kWh" icon="⚡" />
        <DashboardCard title="Monthly Units" value="320" icon="📊" />
        <DashboardCard title="CO₂ Saved" value="260 kg" icon="🌱" />
        <DashboardCard title="Savings" value="₹1,800" icon="💰" />
      </div>
    </div>
  );
}
