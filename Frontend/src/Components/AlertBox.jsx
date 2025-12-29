export default function AlertBox({ type, message, time }) {
  const styles = {
    Critical: "border-red-600 bg-red-50 text-red-800",
    Warning: "border-yellow-500 bg-yellow-50 text-yellow-800",
    Info: "border-blue-500 bg-blue-50 text-blue-800",
  };

  return (
    <div
      className={`p-4 border-l-4 rounded shadow-sm ${styles[type]}`}
    >
      <div className="flex justify-between items-center">
        <p className="font-medium">{message}</p>
        <span className="text-xs opacity-70">
          {new Date(time).toLocaleString()}
        </span>
      </div>

      <span className="text-xs font-semibold uppercase">
        {type}
      </span>
    </div>
  );
}
