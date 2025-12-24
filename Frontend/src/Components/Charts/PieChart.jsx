import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Pie } from "react-chartjs-2";

// ✅ REQUIRED REGISTRATION FOR PIE
ChartJS.register(ArcElement, Tooltip, Legend);

export default function PieChart({ data }) {
  return (
    <Pie
      data={{
        labels: ["Solar", "Coal"],
        datasets: [
          {
            data,
            backgroundColor: ["#16a34a", "#9ca3af"],
          },
        ],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
      }}
    />
  );
}
