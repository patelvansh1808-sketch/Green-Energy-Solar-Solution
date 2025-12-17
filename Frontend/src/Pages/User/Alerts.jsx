import AlertBox from "../../Components/AlertBox.jsx";

export default function Alerts() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="title">System Alerts</h1>

      <AlertBox type="warning" message="Energy dropped 20% compared to yesterday" />
      <AlertBox type="danger" message="Low generation detected" />
    </div>
  );
}
