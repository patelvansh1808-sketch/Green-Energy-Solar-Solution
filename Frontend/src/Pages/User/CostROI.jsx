import { useState } from "react";
import api from "../../services/api";
import LineChart from "../../Components/Charts/LineChart";

export default function CostROI() {
  const [form, setForm] = useState({
    installationCost: "",
    subsidy: "",
    annualEnergy: "",
    electricityRate: "8",
    years: 20,
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const calculateROI = async () => {
    try {
      setLoading(true);

      const payload = {
        installationCost: Number(form.installationCost),
        subsidy: Number(form.subsidy),
        annualEnergy: Number(form.annualEnergy),
        electricityRate: Number(form.electricityRate),
        years: Number(form.years) || 20,
      };

      const res = await api.post("/roi/calculate", payload);
      setResult(res.data.data);

    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "ROI calculation failed");
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    try {
      const payload = {
        installationCost: Number(form.installationCost),
        subsidy: Number(form.subsidy),
        annualEnergy: Number(form.annualEnergy),
        electricityRate: Number(form.electricityRate),
        years: Number(form.years) || 20,
      };

      const res = await api.post("/roi/report", payload, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "ROI_Report.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error(error);
      alert("Failed to download ROI report");
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* HEADER */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-gray-900">
          💹 ROI & Break-Even Analysis
        </h1>
        <p className="text-gray-600 text-lg">
          Calculate your solar investment payback period and long-term savings potential.
        </p>
      </div>

      {/* INPUT FORM CARD */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">System Details</h2>

          {/* Installation Cost */}
          <div className="space-y-2">
            <label className="block font-semibold text-gray-700">
              💰 Installation Cost (₹)
            </label>
            <input
              name="installationCost"
              placeholder="e.g., 300000"
              type="number"
              value={form.installationCost}
              onChange={handleChange}
              className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-green-500 focus:outline-none transition"
            />
            <p className="text-xs text-gray-500">Total upfront system cost</p>
          </div>

          {/* Subsidy */}
          <div className="space-y-2">
            <label className="block font-semibold text-gray-700">
              🎁 Available Subsidy (₹)
            </label>
            <input
              name="subsidy"
              placeholder="e.g., 50000"
              type="number"
              value={form.subsidy}
              onChange={handleChange}
              className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-green-500 focus:outline-none transition"
            />
            <p className="text-xs text-gray-500">Government/state subsidy amount</p>
          </div>

          {/* Annual Energy */}
          <div className="space-y-2">
            <label className="block font-semibold text-gray-700">
              ⚡ Annual Energy Generation (kWh)
            </label>
            <input
              name="annualEnergy"
              placeholder="e.g., 4200"
              type="number"
              value={form.annualEnergy}
              onChange={handleChange}
              className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-green-500 focus:outline-none transition"
            />
            <p className="text-xs text-gray-500">Expected yearly generation from system</p>
          </div>

          {/* Electricity Rate */}
          <div className="space-y-2">
            <label className="block font-semibold text-gray-700">
              ₹/kWh Electricity Rate
            </label>
            <input
              name="electricityRate"
              placeholder="e.g., 8"
              type="number"
              step="0.1"
              value={form.electricityRate}
              onChange={handleChange}
              className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-green-500 focus:outline-none transition"
            />
            <p className="text-xs text-gray-500">Your local grid electricity rate</p>
          </div>

          {/* Analysis Period */}
          <div className="space-y-2">
            <label className="block font-semibold text-gray-700">
              📊 Analysis Period (Years)
            </label>
            <input
              name="years"
              type="number"
              value={form.years}
              onChange={handleChange}
              className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-green-500 focus:outline-none transition"
            />
            <p className="text-xs text-gray-500">Forecast horizon for ROI calculation</p>
          </div>

          {/* Calculate Button */}
          <button
            onClick={calculateROI}
            disabled={loading || !form.installationCost || !form.annualEnergy || !form.electricityRate}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold py-3 rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition mt-4"
          >
            {loading ? "⏳ Calculating..." : "🚀 Calculate ROI"}
          </button>
        </div>

        {/* INFO PANEL */}
        <div className="space-y-4">
          <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-6">
            <h3 className="font-bold text-blue-900 mb-2">💡 How it works</h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>✓ Enter your system cost and expected generation</li>
              <li>✓ Apply any government subsidy to reduce investment</li>
              <li>✓ Multiply energy × electricity rate to get annual savings</li>
              <li>✓ Find break-even point when cumulative savings = investment</li>
            </ul>
          </div>

          <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-6">
            <h3 className="font-bold text-green-900 mb-2">🎯 Example Values</h3>
            <ul className="text-sm text-green-800 space-y-2">
              <li>3kW system: ₹3L cost, ₹4,200 kWh/year</li>
              <li>Subsidy: ₹50k (gov programs)</li>
              <li>Rate: ₹8/kWh (typical)</li>
              <li>Break-even: ~7 years</li>
            </ul>
          </div>

          <div className="bg-purple-50 border-l-4 border-purple-500 rounded-lg p-6">
            <h3 className="font-bold text-purple-900 mb-2">📈 What's included</h3>
            <ul className="text-sm text-purple-800 space-y-2">
              <li>✓ Cumulative savings graph</li>
              <li>✓ Year-wise breakdown</li>
              <li>✓ Break-even milestone</li>
              <li>✓ Downloadable PDF report</li>
            </ul>
          </div>
        </div>
      </div>

      {/* RESULTS SECTION */}
      {result && (
        <>
          {/* KEY METRICS */}
          <div className="grid md:grid-cols-3 gap-4 mt-8">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow-lg p-6 space-y-2">
              <p className="text-blue-100 text-sm font-semibold uppercase">Net Investment</p>
              <p className="text-4xl font-bold">
                ₹{result.netInvestment.toLocaleString("en-IN")}
              </p>
              <p className="text-xs text-blue-200">After subsidy deduction</p>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-lg shadow-lg p-6 space-y-2">
              <p className="text-green-100 text-sm font-semibold uppercase">Annual Savings</p>
              <p className="text-4xl font-bold">
                ₹{result.annualSavings.toLocaleString("en-IN")}
              </p>
              <p className="text-xs text-green-200">Yearly electricity cost reduction</p>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-lg shadow-lg p-6 space-y-2">
              <p className="text-purple-100 text-sm font-semibold uppercase">Break-Even Year</p>
              <p className="text-4xl font-bold">{result.breakEvenYear}</p>
              <p className="text-xs text-purple-200">Payback period in years</p>
            </div>
          </div>

          {/* GRAPH */}
          <div className="bg-white rounded-lg shadow-lg p-8 mt-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">📊 Cumulative Savings Over Time</h3>
            <div className="h-96 bg-gray-50 rounded p-4">
              <LineChart
                labels={result.yearlySavings.map(y => `Yr ${y.year}`)}
                data={result.cumulativeSavings}
                breakEven={result.breakEvenYear}
              />
            </div>
            <p className="text-sm text-gray-600 mt-4 text-center">
              Green area shows savings growth • Break-even occurs at Year {result.breakEvenYear}
            </p>
          </div>

          {/* YEAR-WISE TABLE */}
          <div className="bg-white rounded-lg shadow-lg p-8 mt-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">📋 Year-Wise Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-left py-3 px-4 font-bold text-gray-700">Year</th>
                    <th className="text-right py-3 px-4 font-bold text-gray-700">Annual Savings</th>
                    <th className="text-right py-3 px-4 font-bold text-gray-700">Cumulative</th>
                    <th className="text-center py-3 px-4 font-bold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {result.yearlySavings.map((year, idx) => (
                    <tr
                      key={idx}
                      className={`border-b ${
                        year.year === result.breakEvenYear
                          ? "bg-green-100"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <td className="py-3 px-4 font-semibold text-gray-900">{year.year}</td>
                      <td className="py-3 px-4 text-right text-gray-700">
                        ₹{year.savings.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-gray-900">
                        ₹{result.cumulativeSavings[idx].toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {year.year < result.breakEvenYear ? (
                          <span className="text-orange-600 font-semibold">Recovering</span>
                        ) : year.year === result.breakEvenYear ? (
                          <span className="text-green-600 font-bold">✓ Break-Even</span>
                        ) : (
                          <span className="text-green-600 font-semibold">Profit</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* DOWNLOAD BUTTON */}
          <div className="flex justify-center mt-8">
            <button
              onClick={downloadPDF}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold py-3 px-8 rounded-lg hover:from-blue-700 hover:to-cyan-700 transition shadow-lg"
            >
              📥 Download ROI Report (PDF)
            </button>
          </div>
        </>
      )}
    </div>
  );
}
