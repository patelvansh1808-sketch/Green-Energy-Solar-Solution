import { useState } from "react";
import api from "../../services/api";
import LineChart from "../../Components/Charts/LineChart";

export default function CostROI() {
  const [form, setForm] = useState({
    installationCost: "",
    subsidy: "",
    annualEnergy: "",
    electricityRate: "",
    years: 20,
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ FIX 1: Convert inputs to NUMBERS
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

  // ✅ FIX 2: Proper PDF download (POST + token + body)
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
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">
        ROI & Break-Even Analysis
      </h1>

      {/* INPUT FORM */}
      <div className="grid grid-cols-2 gap-4 bg-white p-4 rounded shadow">
        <input
          name="installationCost"
          placeholder="Installation Cost (₹)"
          type="number"
          onChange={handleChange}
        />
        <input
          name="subsidy"
          placeholder="Subsidy (₹)"
          type="number"
          onChange={handleChange}
        />
        <input
          name="annualEnergy"
          placeholder="Annual Energy (kWh)"
          type="number"
          onChange={handleChange}
        />
        <input
          name="electricityRate"
          placeholder="Electricity Rate (₹/kWh)"
          type="number"
          onChange={handleChange}
        />
      </div>

      <button
        onClick={calculateROI}
        disabled={loading}
        className="mt-4 bg-green-700 text-white px-4 py-2 rounded"
      >
        {loading ? "Calculating..." : "Calculate ROI"}
      </button>

      {/* RESULTS */}
      {result && (
        <>
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="card">
              Net Investment: ₹{result.netInvestment}
            </div>
            <div className="card">
              Annual Savings: ₹{result.annualSavings}
            </div>
            <div className="card">
              Break-Even Year: {result.breakEvenYear}
            </div>
          </div>

          {/* GRAPH */}
          <div className="mt-8 h-96">
            <LineChart
              labels={result.yearlySavings.map(y => `Year ${y.year}`)}
              data={result.cumulativeSavings}
              breakEven={result.breakEvenYear}
            />
          </div>

          {/* PDF BUTTON */}
          <button
            onClick={downloadPDF}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
          >
            Download ROI Report (PDF)
          </button>
        </>
      )}
    </div>
  );
}
