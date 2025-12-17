import LineChart from "../../Components/Charts/LineChart";
import BarChart from "../../Components/Charts/BarChart";

export default function SolarAnalytics() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="title">Solar Analytics</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <LineChart labels={["Mon","Tue","Wed","Thu","Fri"]} data={[12,14,11,15,13]} />
        </div>

        <div className="card">
          <BarChart labels={["Jan","Feb","Mar"]} data={[320,280,350]} />
        </div>
      </div>
    </div>
  );
}
