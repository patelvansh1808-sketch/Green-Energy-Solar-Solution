export default function ManageUsers() {
  return (
    <div className="p-6">
      <h1 className="title">Manage Users</h1>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Email</th>
              <th className="p-2 text-left">Role</th>
              <th className="p-2 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t">
              <td className="p-2">Ved Patel</td>
              <td className="p-2">ved@gmail.com</td>
              <td className="p-2">User</td>
              <td className="p-2">
                <button className="btn text-xs">Make Admin</button>
              </td>
            </tr>
            <tr className="border-t">
              <td className="p-2">Admin User</td>
              <td className="p-2">admin@gmail.com</td>
              <td className="p-2">Admin</td>
              <td className="p-2 text-gray-400">—</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
