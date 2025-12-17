export default function AdminDashboard() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="title">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">👥 Total Users: <b>120</b></div>
        <div className="card">🧾 Total Bookings: <b>45</b></div>
        <div className="card">⏳ Pending Subsidies: <b>8</b></div>
        <div className="card">⚡ Total Energy: <b>18,400 kWh</b></div>
      </div>
    </div>
  );
}
