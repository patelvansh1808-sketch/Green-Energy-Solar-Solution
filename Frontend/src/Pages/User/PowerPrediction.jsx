import { useState } from "react";
import api from "../../services/api";

export default function PowerPrediction() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

 const predict = async () => {
  try {
    setLoading(true);

    const payload = {
      sunlightHours: 6,
      temperature: 30,
    };

    console.log("Sending payload:", payload);

    const res = await api.post("/prediction", payload);

    console.log("Prediction response:", res.data);

    setResult(res.data.predictedKwh);
  } catch (err) {
    console.error("Prediction error:", err.response?.data || err.message);
    alert(err.response?.data?.message || "Prediction failed");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">
        🔮 AI Solar Power Prediction
      </h1>

      <p className="mb-4 text-gray-600">
        Predict tomorrow’s solar energy generation using AI-based analysis.
      </p>

      <button
        onClick={predict}
        disabled={loading}
        className="btn"
      >
        {loading ? "Predicting..." : "Predict Power"}
      </button>

      {result && (
        <div className="card mt-6">
          <h2 className="text-xl font-semibold">
            Predicted Power Output
          </h2>
          <p className="text-green-700 text-3xl font-bold">
            {result} kWh
          </p>
        </div>
      )}
    </div>
  );
}
