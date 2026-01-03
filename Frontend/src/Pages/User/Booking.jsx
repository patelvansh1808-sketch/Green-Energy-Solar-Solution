import { useState } from "react";
import api from "../../services/api";

const solarPlans = {
  Residential: [
    { kW: 1, cost: 60000, subsidy: 0.3 },
    { kW: 3, cost: 150000, subsidy: 0.3 },
    { kW: 5, cost: 250000, subsidy: 0.3 },
  ],
  Commercial: [
    { kW: 10, cost: 400000, subsidy: 0.2 },
    { kW: 25, cost: 900000, subsidy: 0.2 },
  ],
  Industrial: [{ kW: 100, cost: 3500000, subsidy: 0.1 }],
};

export default function Booking() {
  const [type, setType] = useState("Residential");
  const [plan, setPlan] = useState(null);
  const [applySubsidy, setApplySubsidy] = useState(true);
  const [useEmi, setUseEmi] = useState(false);
  const [emiYears, setEmiYears] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const subsidyAmount =
    plan && applySubsidy ? Math.round(plan.cost * plan.subsidy) : 0;

  const finalCost = plan ? plan.cost - subsidyAmount : 0;

  const emiAmount =
    useEmi && plan ? Math.round(finalCost / (emiYears * 12)) : 0;

  const confirmBooking = async () => {
    if (!plan) return;

    try {
      setLoading(true);
      setError("");

      // ✅ Correct API endpoint + payload matches backend schema
      await api.post("/bookings/create", {
        systemType: type,
        capacity: plan.kW,
        baseCost: plan.cost,
        subsidyApplied: applySubsidy,
        subsidyAmount,
        finalCost,
        emiEnabled: useEmi,
        emiYears: useEmi ? emiYears : null,
        monthlyEmi: useEmi ? emiAmount : null,
      });

      alert("✅ Booking successful!");
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Booking not allowed. Please contact support.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto animate-fade">
      <h1 className="text-2xl font-bold mb-6">🌞 Solar Panel Booking</h1>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded">
          {error}
        </div>
      )}

      {/* Solar Type */}
      <div className="mb-6">
        <label className="block mb-2 font-medium">
          Select Solar System Type
        </label>
        <select
          className="input"
          value={type}
          onChange={(e) => {
            setType(e.target.value);
            setPlan(null);
            setApplySubsidy(true);
            setUseEmi(false);
            setError("");
          }}
        >
          <option>Residential</option>
          <option>Commercial</option>
          <option>Industrial</option>
        </select>
      </div>

      {/* Plans */}
      <div className="grid md:grid-cols-3 gap-4">
        {solarPlans[type].map((item, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg shadow cursor-pointer border-2 ${
              plan === item ? "border-green-600" : "border-transparent"
            }`}
            onClick={() => {
              setPlan(item);
              setApplySubsidy(true);
              setUseEmi(false);
              setError("");
            }}
          >
            <h3 className="text-xl font-semibold">
              {item.kW} kW System
            </h3>
            <p className="text-gray-600">
              Base Cost: ₹{item.cost.toLocaleString()}
            </p>
            <p className="text-sm text-green-700">
              Subsidy: {item.subsidy * 100}%
            </p>
          </div>
        ))}
      </div>

      {/* Cost Section */}
      {plan && (
        <div className="bg-white rounded shadow p-6 mt-8 space-y-4">
          <h2 className="text-xl font-bold">💰 Cost Breakdown</h2>

          <p><strong>Capacity:</strong> {plan.kW} kW</p>
          <p>
            <strong>Original Cost:</strong> ₹{plan.cost.toLocaleString()}
          </p>

          {/* Subsidy */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={applySubsidy}
              onChange={() => setApplySubsidy(!applySubsidy)}
            />
            <label>Apply Government Subsidy</label>
          </div>

          {applySubsidy && (
            <p className="text-green-700">
              Subsidy Applied: -₹{subsidyAmount.toLocaleString()}
            </p>
          )}

          <p className="text-lg font-semibold">
            Final Payable Cost: ₹{finalCost.toLocaleString()}
          </p>

          {/* EMI */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={useEmi}
              onChange={() => setUseEmi(!useEmi)}
            />
            <label>Pay using EMI</label>
          </div>

          {useEmi && (
            <>
              <select
                className="input"
                value={emiYears}
                onChange={(e) => setEmiYears(Number(e.target.value))}
              >
                <option value={3}>3 Years</option>
                <option value={5}>5 Years</option>
                <option value={7}>7 Years</option>
              </select>

              <p className="font-semibold text-green-700">
                Monthly EMI: ₹{emiAmount.toLocaleString()}
              </p>
            </>
          )}

          <button
            onClick={confirmBooking}
            disabled={loading}
            className="w-full bg-green-700 hover:bg-green-800 text-white py-2 rounded font-semibold"
          >
            {loading ? "Processing..." : "Confirm Booking"}
          </button>
        </div>
      )}
    </div>
  );
}
