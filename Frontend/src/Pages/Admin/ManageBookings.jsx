export default function ManageBookings() {
  return (
    <div className="p-6">
      <h1 className="title">Manage Bookings</h1>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">User</th>
              <th className="p-2 text-left">Capacity</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t">
              <td className="p-2">Ved Patel</td>
              <td className="p-2">3 kW</td>
              <td className="p-2 text-yellow-600">Pending</td>
              <td className="p-2 space-x-2">
                <button className="btn text-xs">Approve</button>
                <button className="btn bg-red-600 hover:bg-red-700 text-xs">
                  Reject
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
