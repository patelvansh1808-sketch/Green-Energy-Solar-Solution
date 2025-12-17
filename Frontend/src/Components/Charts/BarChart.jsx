import { Bar } from "react-chartjs-2";

export default function BarChart({ labels, data }) {
  return (
    <Bar
      data={{
        labels,
        datasets: [
          {
            label: "Units",
            data,
            backgroundColor: "#16a34a"
          }
        ]
      }}
    />
  );
}
