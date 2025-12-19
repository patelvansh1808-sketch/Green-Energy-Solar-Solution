import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-primary text-white px-6 py-3 flex justify-between">
      <h1 className="font-bold">🌞 Green Energy</h1>
      <div className="space-x-4 text-sm">
        <Link to="/">Home</Link>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/booking">Booking</Link>
        <Link to="/subsidy">Subsidy</Link>
        <Link to="/admin">Admin</Link>
        <Link className="hover:text-green-200" to="/contact">
  Contact
</Link>

      </div>
    </nav>
  );
}
