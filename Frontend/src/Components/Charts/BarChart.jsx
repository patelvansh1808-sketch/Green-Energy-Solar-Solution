import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

// ✅ REQUIRED REGISTRATION
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

export default function BarChart({ labels, data }) {
  return (
    <Bar
      data={{
        labels,
        datasets: [
          {
            label: "Units",
            data,
            backgroundColor: "#16a34a",
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
