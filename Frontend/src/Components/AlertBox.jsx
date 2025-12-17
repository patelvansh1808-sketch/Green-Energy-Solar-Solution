export default function AlertBox({ type, message }) {
  const colors = {
    warning: "bg-yellow-100 text-yellow-800",
    danger: "bg-red-100 text-red-800",
    success: "bg-green-100 text-green-800"
  };

  return (
    <div className={`p-3 rounded ${colors[type]}`}>
      ⚠ {message}
    </div>
  );
}
