export default function SubsidyRules() {
  return (
    <div className="p-6 max-w-xl">
      <h1 className="title">Subsidy Rules Management</h1>

      <div className="card space-y-4">
        <div>
          <label className="block text-sm text-gray-600">
            Up to 3kW Subsidy (%)
          </label>
          <input className="border p-2 w-full" value="40" />
        </div>

        <div>
          <label className="block text-sm text-gray-600">
            3kW – 10kW Subsidy (%)
          </label>
          <input className="border p-2 w-full" value="20" />
        </div>

        <div>
          <label className="block text-sm text-gray-600">
            Above 10kW Subsidy (%)
          </label>
          <input className="border p-2 w-full" value="0" />
        </div>

        <button className="btn w-full">Update Rules</button>
      </div>
    </div>
  );
}
