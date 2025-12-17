import NotificationItem from "../../Components/NotificationItem";

export default function Notifications() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="title">Notifications</h1>

      <NotificationItem
        title="Booking Approved"
        message="Your 3kW solar panel booking has been approved."
        time="2 hours ago"
        type="success"
      />

      <NotificationItem
        title="Subsidy Update"
        message="You are eligible for 40% government subsidy."
        time="Yesterday"
        type="info"
      />

      <NotificationItem
        title="Low Energy Alert"
        message="Energy generation dropped by 20% today."
        time="Just now"
        type="warning"
      />
    </div>
  );
}
