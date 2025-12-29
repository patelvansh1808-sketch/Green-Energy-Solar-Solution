import { useState, useEffect } from "react";
import { getSmartRecommendations } from "../../services/recommendationService";

export default function Recommendations() {
  const [recommendations, setRecommendations] = useState(null);
  const [availableFunding, setAvailableFunding] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async (funding = 0) => {
    try {
      setLoading(true);
      setError("");
      const rec = await getSmartRecommendations(funding);
      setRecommendations(rec);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load recommendations");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    const funding = Number(availableFunding) || 0;
    await fetchRecommendations(funding);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">🎯 Smart Recommendations</h1>
        <p className="text-gray-600 mt-2">
          AI-powered suggestions tailored to your usage pattern and budget.
        </p>
      </div>

      {/* FUNDING INPUT */}
      <div className="bg-white rounded shadow p-4 flex items-end gap-3">
        <div className="flex-1">
          <label className="block text-sm font-semibold mb-2">
            Available Budget (₹) - Optional
          </label>
          <input
            type="number"
            value={availableFunding}
            onChange={(e) => setAvailableFunding(e.target.value)}
            placeholder="Enter available funds to optimize EMI vs lump sum"
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <button
          onClick={handleUpdate}
          className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800"
          disabled={loading}
        >
          {loading ? "Loading..." : "Update"}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-300 rounded p-4 text-red-800">
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8 text-gray-500">Analyzing your usage...</div>
      ) : recommendations ? (
        <>
          {/* SUMMARY CARD */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded shadow p-6 space-y-2">
            <h2 className="text-xl font-bold">System Cost Breakdown</h2>
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div>
                <p className="text-sm opacity-90">Gross Cost</p>
                <p className="text-2xl font-bold">
                  ₹{recommendations.summary.grossSystemCost.toLocaleString("en-IN")}
                </p>
              </div>
              <div>
                <p className="text-sm opacity-90">Subsidy Available</p>
                <p className="text-2xl font-bold text-green-100">
                  -₹{recommendations.summary.subsidyAvailable.toLocaleString("en-IN")}
                </p>
              </div>
              <div>
                <p className="text-sm opacity-90">Net Cost</p>
                <p className="text-2xl font-bold">
                  ₹{recommendations.summary.netCost.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          </div>

          {/* PANEL RECOMMENDATION */}
          <div className="bg-white rounded shadow p-6 border-l-4 border-blue-500 space-y-3">
            <h3 className="text-lg font-bold text-blue-700">☀️ Panel Size Recommendation</h3>
            <div className="text-3xl font-bold text-blue-600">
              {recommendations.panel.recommendedCapacity} kW
            </div>
            <p className="text-gray-700">
              <strong>Current Average Usage:</strong> {recommendations.panel.avgDailyUsage} kWh/day
            </p>
            <p className="text-gray-700">
              <strong>Estimated Cost:</strong> ₹
              {recommendations.panel.estimatedCost.toLocaleString("en-IN")}
            </p>
            <p className="text-sm text-gray-600 italic border-t pt-2">
              💡 {recommendations.panel.reason}
            </p>
          </div>

          {/* PAYMENT RECOMMENDATION */}
          <div className="bg-white rounded shadow p-6 border-l-4 border-purple-500 space-y-3">
            <h3 className="text-lg font-bold text-purple-700">💳 Payment Strategy</h3>
            <div className="text-2xl font-bold text-purple-600">
              {recommendations.payment.recommendation}
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-purple-50 p-3 rounded">
                <p className="text-sm text-gray-600">Monthly EMI</p>
                <p className="text-xl font-bold text-purple-700">
                  ₹{recommendations.payment.monthlyEmi.toLocaleString("en-IN")}
                </p>
              </div>
              <div className="bg-purple-50 p-3 rounded">
                <p className="text-sm text-gray-600">Total Cost ({recommendations.payment.emiDuration}y EMI)</p>
                <p className="text-xl font-bold text-purple-700">
                  ₹{recommendations.payment.totalCost.toLocaleString("en-IN")}
                </p>
              </div>
            </div>

            {recommendations.payment.totalInterest > 0 && (
              <p className="text-sm text-gray-600">
                Interest: ₹{recommendations.payment.totalInterest.toLocaleString("en-IN")}
              </p>
            )}

            <p className="text-sm text-gray-700 italic border-t pt-2">
              🎯 {recommendations.payment.reasoning}
            </p>
          </div>

          {/* SUBSIDY RECOMMENDATION */}
          <div className="bg-white rounded shadow p-6 border-l-4 border-green-500 space-y-3">
            <h3 className="text-lg font-bold text-green-700">💚 Subsidy Eligibility</h3>
            <div className="text-2xl font-bold text-green-600">
              ₹{recommendations.subsidy.estimatedSubsidy.toLocaleString("en-IN")}
            </div>

            {recommendations.subsidy.state && (
              <p className="text-gray-700">
                <strong>State:</strong> {recommendations.subsidy.state}
              </p>
            )}

            <p className="text-gray-700">
              <strong>Eligibility:</strong> <span className="text-green-600">✅ Eligible</span>
            </p>

            {recommendations.subsidy.maxPercentage && (
              <p className="text-gray-700">
                <strong>Subsidy Rate:</strong> Up to {recommendations.subsidy.maxPercentage}% of system cost
              </p>
            )}

            <p className="text-sm text-gray-700 italic border-t pt-2">
              ✨ {recommendations.subsidy.reason}
            </p>
          </div>

          {/* ACTION CARDS */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded shadow p-6 space-y-3">
              <h4 className="font-bold text-blue-900">Next Steps</h4>
              <ol className="text-sm text-blue-900 space-y-2 list-decimal list-inside">
                <li>Review recommended {recommendations.panel.recommendedCapacity}kW system size</li>
                <li>Decide between {recommendations.payment.recommendation}</li>
                <li>Apply for subsidy (₹{recommendations.subsidy.estimatedSubsidy.toLocaleString("en-IN")})</li>
                <li>Create booking with final cost details</li>
              </ol>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded shadow p-6 space-y-3">
              <h4 className="font-bold text-green-900">Your Benefits</h4>
              <ul className="text-sm text-green-900 space-y-2">
                <li>✓ Customized to your usage pattern</li>
                <li>✓ Optimized for your budget</li>
                <li>✓ Maximum subsidy applied</li>
                <li>✓ Flexible payment options</li>
              </ul>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
