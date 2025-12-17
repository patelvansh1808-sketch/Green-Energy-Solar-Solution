export default function Booking() {
  return (
    <div className="p-6 card">
      <h1 className="title">Solar Panel Booking</h1>

      <select className="border p-2 w-full mb-3">
        <option>1 kW</option>
        <option>3 kW</option>
        <option>5 kW</option>
      </select>

      <input className="border p-2 w-full mb-3" placeholder="Roof Area (sq ft)" />

      <button className="btn">Book Installation</button>
    </div>
  );
}
