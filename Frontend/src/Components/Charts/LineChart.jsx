import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

export default function LineChart({ labels, data, breakEven }) {
  return (
    <Line
      data={{
        labels,
        datasets: [
          {
            label: "Cumulative Savings (₹)",
            data,
            borderColor: "#15803d",
            backgroundColor: "rgba(21,128,61,0.2)",
            tension: 0.3,
          },
          {
            label: "Break-Even Point",
            data: data.map((_, i) =>
              i + 1 === breakEven ? data[i] : null
            ),
            borderColor: "red",
            pointRadius: 6,
            pointBackgroundColor: "red",
            showLine: false,
          },
        ],
      }}
      options={{
        responsive: true,
        plugins: {
          legend: { position: "bottom" },
        },
      }}
    />
  );
}
