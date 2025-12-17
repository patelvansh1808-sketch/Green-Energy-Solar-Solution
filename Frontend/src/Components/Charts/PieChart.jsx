import { Pie } from "react-chartjs-2";

export default function PieChart({ data }) {
  return (
    <Pie
      data={{
        labels: ["Solar", "Coal"],
        datasets: [
          {
            data,
            backgroundColor: ["#16a34a", "#9ca3af"]
          }
        ]
      }}
    />
  );
}
