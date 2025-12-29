import { useEffect, useState } from "react";
import api from "../../services/api";
import AlertBox from "../../Components/AlertBox";

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await api.get("/alerts");
        setAlerts(res.data);
      } catch (error) {
        console.error(error);
        alert("Failed to load alerts");
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, []);

  return (
    <div className="p-6 space-y-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold">System Alerts</h1>

      {loading && <p>Loading alerts...</p>}

      {!loading && alerts.length === 0 && (
        <p className="text-gray-500">No alerts found</p>
      )}

      {alerts.map((alert) => (
        <AlertBox
          key={alert._id}
          type={alert.type}
          message={alert.message}
          time={alert.createdAt}
        />
      ))}
    </div>
  );
}
