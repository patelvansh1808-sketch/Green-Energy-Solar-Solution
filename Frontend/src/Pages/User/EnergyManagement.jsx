import { useCallback, useEffect, useMemo, useState } from "react";
import EnergyUpload from "../../Components/EnergyUpload";
import { addDailyEnergyEntry, getEnergyHistory } from "../../services/energyService";

export default function EnergyManagement() {
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    unitsGenerated: "",
    peakPower: "",
    efficiency: "",
    temperature: "",
    inverterStatus: "online",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [message, setMessage] = useState("");
  const [range, setRange] = useState("month");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const startOfDay = (value) => {
    const d = new Date(value);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const formatDateOnly = (value) => {
    const d = new Date(value);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const endOfDay = (value) => {
    const d = new Date(value);
    d.setHours(23, 59, 59, 999);
    return d;
  };

  const computedRange = useMemo(() => {
    const today = new Date();
    if (range === "day") {
      return { from: startOfDay(today), to: endOfDay(today) };
    }
    if (range === "week") {
      const start = new Date(today);
      start.setDate(today.getDate() - 6);
      return { from: startOfDay(start), to: endOfDay(today) };
    }
    if (range === "month") {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      return { from: startOfDay(start), to: endOfDay(end) };
    }
    if (range === "custom" && customFrom && customTo) {
      return { from: startOfDay(customFrom), to: endOfDay(customTo) };
    }
    return { from: null, to: null };
  }, [range, customFrom, customTo]);

  const loadHistory = useCallback(async () => {
    try {
      const params = { limit: 200 };
      if (computedRange.from && computedRange.to) {
        params.from = formatDateOnly(computedRange.from);
        params.to = formatDateOnly(computedRange.to);
      }
      const res = await getEnergyHistory(params);
      const rows = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : res?.data || [];
      setHistory(rows);
    } catch (err) {
      console.error(err);
    }
  }, [computedRange]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const payload = {
        ...form,
        unitsGenerated: Number(form.unitsGenerated),
        peakPower: form.peakPower ? Number(form.peakPower) : 0,
        efficiency: form.efficiency ? Number(form.efficiency) : 0,
        temperature: form.temperature ? Number(form.temperature) : 0,
      };
      const res = await addDailyEnergyEntry(payload);
      if (res.success) {
        setMessage("✅ Daily energy entry saved");
        setForm({
          date: new Date().toISOString().split("T")[0],
          unitsGenerated: "",
          peakPower: "",
          efficiency: "",
          temperature: "",
          inverterStatus: "online",
          notes: "",
        });
        loadHistory();
      } else {
        setMessage(res.message || "❌ Failed to save");
      }
    } catch (err) {
      setMessage(err.response?.data?.message || err.message || "❌ Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-green-700 mb-4">⚡ Energy Data Management</h1>

      <section className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Daily Energy Entry</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Date *</label>
            <input type="date" name="date" value={form.date} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium">Units Generated (kWh) *</label>
            <input type="number" step="0.01" name="unitsGenerated" value={form.unitsGenerated} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium">Peak Power (kW)</label>
            <input type="number" step="0.01" name="peakPower" value={form.peakPower} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium">Efficiency (%)</label>
            <input type="number" step="0.01" name="efficiency" value={form.efficiency} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium">Temperature (°C)</label>
            <input type="number" step="0.01" name="temperature" value={form.temperature} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium">Inverter Status</label>
            <select name="inverterStatus" value={form.inverterStatus} onChange={handleChange} className="w-full border rounded px-3 py-2">
              <option value="online">Online</option>
              <option value="offline">Offline</option>
              <option value="warning">Warning</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium">Notes</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} className="w-full border rounded px-3 py-2" rows="3" />
          </div>
          <div className="md:col-span-2">
            <button disabled={loading} className="bg-green-600 text-white px-4 py-2 rounded">
              {loading ? "Saving..." : "Save Daily Entry"}
            </button>
            {message && <p className="mt-2 text-sm">{message}</p>}
          </div>
        </form>
      </section>

      <section className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">History Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium">Range</label>
            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="day">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">From</label>
            <input
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="w-full border rounded px-3 py-2"
              disabled={range !== "custom"}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">To</label>
            <input
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              className="w-full border rounded px-3 py-2"
              disabled={range !== "custom"}
            />
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={loadHistory}
              className="bg-green-600 text-white px-4 py-2 rounded w-full"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Excel Upload</h2>
        <EnergyUpload apiBase="http://localhost:5000" />
      </section>

      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Recent History</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2">Date</th>
                <th className="py-2">Units</th>
                <th className="py-2">Peak</th>
                <th className="py-2">Efficiency</th>
                <th className="py-2">Temp</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 && (
                <tr><td className="py-3" colSpan="6">No records found</td></tr>
              )}
              {history.map((row) => (
                <tr key={row._id} className="border-b">
                  <td className="py-2">{new Date(row.date).toLocaleDateString()}</td>
                  <td className="py-2">{row.unitsGenerated}</td>
                  <td className="py-2">{row.peakPower}</td>
                  <td className="py-2">{row.efficiency}</td>
                  <td className="py-2">{row.temperature}</td>
                  <td className="py-2">{row.inverterStatus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
