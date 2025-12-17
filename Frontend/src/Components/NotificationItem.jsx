export default function NotificationItem({
  title,
  message,
  time,
  type = "info"
}) {
  const styles = {
    info: "bg-blue-50 border-blue-400 text-blue-800",
    success: "bg-green-50 border-green-500 text-green-800",
    warning: "bg-yellow-50 border-yellow-500 text-yellow-800",
    danger: "bg-red-50 border-red-500 text-red-800"
  };

  const icons = {
    info: "ℹ️",
    success: "✅",
    warning: "⚠️",
    danger: "❌"
  };

  return (
    <div
      className={`flex items-start gap-3 border-l-4 p-4 rounded-lg shadow-sm ${styles[type]}`}
    >
      <div className="text-xl">{icons[type]}</div>

      <div className="flex-1">
        <h4 className="font-semibold text-sm">{title}</h4>
        <p className="text-sm mt-1">{message}</p>
        <span className="text-xs opacity-70">{time}</span>
      </div>
    </div>
  );
}
