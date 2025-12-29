import { useState } from "react";
import {
  downloadMonthlyEnergyPDF,
  downloadMonthlyEnergyExcel,
  downloadCostSavingsPDF,
  downloadBookingInvoice,
} from "../../services/reportService";
import api from "../../services/api";

export default function Reports() {
  const [monthValue, setMonthValue] = useState("");
  const [rate, setRate] = useState(8);
  const [bookingId, setBookingId] = useState("");
  const [busy, setBusy] = useState(false);

  const handle = async (fn) => {
    try {
      setBusy(true);
      await fn();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || err.message || "Download failed");
    } finally {
      setBusy(false);
    }
  };

  const generateSampleData = async () => {
    try {
      setBusy(true);
      const res = await api.post("/energy/generate-sample");
      alert(res.data.message + "\n" + res.data.dateRange);
    } catch (err) {
      alert("Failed to generate sample data: " + (err.response?.data?.message || err.message));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reports & Exports</h1>
          <p className="text-gray-600">Download operational documents for compliance and stakeholder updates.</p>
        </div>
        <input
          type="month"
          value={monthValue}
          onChange={(e) => setMonthValue(e.target.value)}
          className="border rounded px-3 py-2 text-sm"
        />
      </div>

      {/* SAMPLE DATA GENERATOR */}
      <div className="bg-yellow-50 border border-yellow-300 rounded p-4 space-y-2">
        <p className="text-sm text-yellow-900">
          ⚠️ <strong>No data?</strong> Click below to generate 90 days of realistic sample energy records.
        </p>
        <button
          className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
          disabled={busy}
          onClick={generateSampleData}
        >
          {busy ? "Generating..." : "Generate Sample Data"}
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded shadow p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold">Monthly Energy Report</h2>
              <p className="text-sm text-gray-600">Generation summary with daily breakdown.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              className="bg-green-700 text-white px-4 py-2 rounded"
              disabled={busy}
              onClick={() => handle(() => downloadMonthlyEnergyPDF(monthValue))}
            >
              Download PDF
            </button>
            <button
              className="bg-emerald-100 text-green-800 px-4 py-2 rounded border border-green-200"
              disabled={busy}
              onClick={() => handle(() => downloadMonthlyEnergyExcel(monthValue))}
            >
              Export Excel
            </button>
          </div>
        </div>

        <div className="bg-white rounded shadow p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold">Cost & Savings Report</h2>
              <p className="text-sm text-gray-600">Applies your tariff to monthly generation.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="number"
              className="border rounded px-3 py-2 w-28"
              value={rate}
              min={0}
              step={0.1}
              onChange={(e) => setRate(e.target.value)}
              placeholder="₹/kWh"
            />
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded"
              disabled={busy}
              onClick={() => handle(() => downloadCostSavingsPDF(monthValue, rate))}
            >
              Download PDF
            </button>
          </div>
        </div>

        <div className="bg-white rounded shadow p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold">Booking Invoice</h2>
              <p className="text-sm text-gray-600">Generate a PDF invoice for a specific booking.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              className="border rounded px-3 py-2 flex-1"
              value={bookingId}
              onChange={(e) => setBookingId(e.target.value)}
              placeholder="Enter booking ID"
            />
            <button
              className="bg-indigo-600 text-white px-4 py-2 rounded"
              disabled={busy}
              onClick={() => handle(() => downloadBookingInvoice(bookingId))}
            >
              Download PDF
            </button>
          </div>
        </div>

        <div className="bg-white rounded shadow p-4 space-y-2">
          <h2 className="font-semibold">How it works</h2>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
            <li>Month picker controls the reporting window; defaults to current month if left blank.</li>
            <li>Tariff applies a simple ₹/kWh rate to estimate savings.</li>
            <li>Invoice requires a valid booking ID from your bookings list.</li>
            <li>Use "Generate Sample Data" to populate your account with test records.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
