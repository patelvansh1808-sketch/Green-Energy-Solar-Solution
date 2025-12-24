import { useEffect, useState } from "react";
import api from "../../services/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/admin/stats");
        setStats(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load live data");
      }
    };

    fetchStats();
  }, []);

  if (error) {
    return <p className="p-6 text-red-600">{error}</p>;
  }

  if (!stats) {
    return <p className="p-6">Loading live data...</p>;
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      <div className="grid md:grid-cols-4 gap-6">
        <div className="card">
          👥 Total Users: <strong>{stats.totalUsers}</strong>
        </div>

        <div className="card">
          📦 Total Bookings: <strong>{stats.totalBookings}</strong>
        </div>

        <div className="card">
          ⏳ Pending Subsidies: <strong>{stats.pendingSubsidies}</strong>
        </div>

        <div className="card">
          ⚡ Total Energy: <strong>{stats.totalEnergy} kWh</strong>
        </div>
      </div>
    </div>
  );
}
