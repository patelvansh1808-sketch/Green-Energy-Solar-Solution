import PieChart from "../../components/Charts/PieChart";

export default function CarbonFootprint() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="title">Carbon Footprint</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <p>🌱 CO₂ Saved: <b>420 kg</b></p>
          <p>🌳 Trees Equivalent: <b>18</b></p>
        </div>

        <div className="card">
          <PieChart data={[70, 30]} />
        </div>
      </div>
    </div>
  );
}
