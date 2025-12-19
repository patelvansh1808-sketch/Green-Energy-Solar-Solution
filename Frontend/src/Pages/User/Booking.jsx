import { useState } from "react";

const solarPlans = {
  Residential: [
    { kW: 1, cost: 60000, subsidy: 0.3 },
    { kW: 3, cost: 150000, subsidy: 0.3 },
    { kW: 5, cost: 250000, subsidy: 0.3 }
  ],
  Commercial: [
    { kW: 10, cost: 400000, subsidy: 0.2 },
    { kW: 25, cost: 900000, subsidy: 0.2 }
  ],
  Industrial: [
    { kW: 100, cost: 3500000, subsidy: 0.1 }
  ]
};

export default function Booking() {
  const [type, setType] = useState("Residential");
  const [plan, setPlan] = useState(null);

  const [applySubsidy, setApplySubsidy] = useState(true);

  const [useEmi, setUseEmi] = useState(false);
  const [emiYears, setEmiYears] = useState(5);

  const subsidyAmount =
    plan && applySubsidy ? plan.cost * plan.subsidy : 0;

  const finalCost = plan ? plan.cost - subsidyAmount : 0;

  const emiAmount =
    useEmi && plan
      ? Math.round(finalCost / (emiYears * 12))
      : 0;

  return (
    <div className="p-6 max-w-5xl mx-auto animate-fade">
      <h1 className="title">🌞 Solar Panel Booking</h1>

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
            className={`card cursor-pointer border-2 ${
              plan === item
                ? "border-primary"
                : "border-transparent"
            }`}
            onClick={() => {
              setPlan(item);
              setApplySubsidy(true);
              setUseEmi(false);
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
        <div className="card mt-8 space-y-4">
          <h2 className="text-xl font-bold">💰 Cost Breakdown</h2>

          <p>
            <strong>Capacity:</strong> {plan.kW} kW
          </p>

          <p>
            <strong>Original Cost:</strong>{" "}
            ₹{plan.cost.toLocaleString()}
          </p>

          {/* Subsidy Toggle */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={applySubsidy}
              onChange={() =>
                setApplySubsidy(!applySubsidy)
              }
            />
            <label className="font-medium">
              Apply Government Subsidy
            </label>
          </div>

          {applySubsidy && (
            <p className="text-green-700">
              <strong>Subsidy Applied:</strong>{" "}
              -₹{subsidyAmount.toLocaleString()}
            </p>
          )}

          <p className="text-lg font-semibold">
            <strong>Final Payable Cost:</strong>{" "}
            ₹{finalCost.toLocaleString()}
          </p>

          {/* EMI Option */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={useEmi}
              onChange={() => setUseEmi(!useEmi)}
            />
            <label className="font-medium">
              Pay using EMI
            </label>
          </div>

          {useEmi && (
            <div className="space-y-2">
              <select
                className="input"
                value={emiYears}
                onChange={(e) =>
                  setEmiYears(Number(e.target.value))
                }
              >
                <option value={3}>3 Years</option>
                <option value={5}>5 Years</option>
                <option value={7}>7 Years</option>
              </select>

              <p className="text-primary font-semibold">
                Monthly EMI: ₹{emiAmount.toLocaleString()}
              </p>
            </div>
          )}

          <button className="btn w-full mt-4">
            Confirm Booking
          </button>
        </div>
      )}
    </div>
  );
}
