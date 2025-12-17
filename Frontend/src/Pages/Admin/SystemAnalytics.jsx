import BarChart from "../../Components/Charts/BarChart.jsx";

export default function SystemAnalytics() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="title">System Analytics</h1>

      <div className="card">
        <BarChart
          labels={["Jan", "Feb", "Mar", "Apr"]}
          data={[4200, 3900, 4800, 5100]}
        />
      </div>

      <div className="card">
        <p>📈 Peak Generation Month: <b>April</b></p>
        <p>📉 Lowest Generation Month: <b>February</b></p>
      </div>
    </div>
  );
}
