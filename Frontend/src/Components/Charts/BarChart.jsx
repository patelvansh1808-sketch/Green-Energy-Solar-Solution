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

export default function BarChart({ labels, data, label = "Value" }) {
  return (
    <Bar
      data={{
        labels,
        datasets: [
          {
            label,
            data,
            backgroundColor: "#16a34a",
          },
        ],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => value.toLocaleString("en-IN"),
            },
          },
        },
      }}
    />
  );
}
