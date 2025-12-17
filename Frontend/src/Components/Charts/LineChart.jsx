import { Line } from "react-chartjs-2";

export default function LineChart({ labels, data }) {
  return (
    <Line
      data={{
        labels,
        datasets: [
          {
            label: "Energy (kWh)",
            data,
            borderColor: "#15803d",
            fill: false
          }
        ]
      }}
    />
  );
}
