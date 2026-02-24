import { useCallback, useEffect, useState } from "react";
import inventoryService from "../../services/inventoryService";

const formatCurrency = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

const emptyItem = {
  name: "",
  sku: "",
  category: "panel",
  unit: "pcs",
  brand: "",
  model: "",
  capacity: "",
  location: "",
  supplier: "",
  costPrice: 0,
  sellingPrice: 0,
  minStock: 0,
  stockOnHand: 0,
  status: "active",
  notes: "",
};

export default function InventoryManagement() {
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    status: "active",
    lowStock: false,
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState(emptyItem);
  const [selectedItem, setSelectedItem] = useState(null);
  const [adjustData, setAdjustData] = useState({
    type: "in",
    quantity: 0,
    reason: "",
  });

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const [itemsRes, statsRes] = await Promise.all([
        inventoryService.getItems({
          search: filters.search || undefined,
          category: filters.category || undefined,
          status: filters.status || undefined,
          lowStock: filters.lowStock ? "true" : undefined,
        }),
        inventoryService.getStats(),
      ]);
      setItems(itemsRes);
      setStats(statsRes);
      setError("");
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to load inventory");
    } finally {
      setLoading(false);
    }
  }, [filters.search, filters.category, filters.status, filters.lowStock]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleCreate = async () => {
    try {
      await inventoryService.createItem(formData);
      setShowAddModal(false);
      setFormData(emptyItem);
      fetchAll();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to create item");
    }
  };

  const handleAdjust = async () => {
    if (!selectedItem) return;
    try {
      await inventoryService.adjustStock(selectedItem._id, adjustData);
      setSelectedItem(null);
      setAdjustData({ type: "in", quantity: 0, reason: "" });
      fetchAll();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to adjust stock");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <p className="text-gray-600">Loading inventory...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">Inventory & Asset Management</h1>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-lg"
          >
            ➕ Add Item
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
            {error}
          </div>
        )}

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
              <p className="text-sm text-gray-500">Total Items</p>
              <p className="text-2xl font-bold text-blue-600 mt-2">{stats.totalItems}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
              <p className="text-sm text-gray-500">Low Stock Alerts</p>
              <p className="text-2xl font-bold text-red-600 mt-2">{stats.lowStock}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-emerald-500">
              <p className="text-sm text-gray-500">Total Stock Value</p>
              <p className="text-2xl font-bold text-emerald-600 mt-2">
                {formatCurrency(stats.totalStockValue)}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
              <p className="text-sm text-gray-500">Categories</p>
              <p className="text-xs text-gray-500 mt-2">
                Panels: {stats.byCategory?.panel || 0} | Inverters: {stats.byCategory?.inverter || 0}
              </p>
              <p className="text-xs text-gray-500">
                Meters: {stats.byCategory?.meter || 0} | Spares: {stats.byCategory?.spare || 0}
              </p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Search</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Name, SKU, brand"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">All</option>
                <option value="panel">Solar Panels</option>
                <option value="inverter">Inverters</option>
                <option value="meter">Net Meters</option>
                <option value="spare">Spare Parts</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilters({ ...filters, lowStock: !filters.lowStock })}
                className={`w-full font-semibold py-2 px-4 rounded-lg transition ${
                  filters.lowStock
                    ? "bg-red-100 text-red-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {filters.lowStock ? "Low Stock: ON" : "Low Stock: OFF"}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {items.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No inventory items found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Item</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Category</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Stock</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Min Stock</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Location</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item._id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-gray-800">{item.name}</p>
                          <p className="text-xs text-gray-500">SKU: {item.sku}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 capitalize">{item.category}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {item.stockOnHand} {item.unit}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{item.minStock}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{item.location || "—"}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedItem(item)}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-3 py-1 rounded"
                        >
                          Adjust Stock
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8 bg-gradient-to-r from-emerald-600 to-green-600 rounded-t-2xl">
              <h2 className="text-3xl font-bold text-white">Add New Inventory Item</h2>
              <p className="text-emerald-100 mt-1">Fill in the details to add a new item to inventory</p>
            </div>

            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-semibold text-gray-700">Item Name <span className="text-red-500">*</span></label>
                  <input
                    className="mt-2 w-full border border-emerald-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Enter item name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700">Item Code <span className="text-red-500">*</span></label>
                  <input
                    className="mt-2 w-full border border-emerald-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="e.g., SP-001"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700">Category <span className="text-red-500">*</span></label>
                  <select
                    className="mt-2 w-full border border-emerald-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="panel">Solar Panel</option>
                    <option value="inverter">Inverter</option>
                    <option value="meter">Net Meter</option>
                    <option value="spare">Spare Part</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700">Quantity <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    min="0"
                    className="mt-2 w-full border border-emerald-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={formData.stockOnHand}
                    onChange={(e) => setFormData({ ...formData, stockOnHand: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700">Unit <span className="text-red-500">*</span></label>
                  <select
                    className="mt-2 w-full border border-emerald-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  >
                    <option value="pcs">Piece</option>
                    <option value="set">Set</option>
                    <option value="box">Box</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700">Purchase Price <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    min="0"
                    className="mt-2 w-full border border-emerald-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700">Selling Price <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    min="0"
                    className="mt-2 w-full border border-emerald-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700">Minimum Stock Level <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    min="0"
                    className="mt-2 w-full border border-emerald-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={formData.minStock}
                    onChange={(e) => setFormData({ ...formData, minStock: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700">Supplier</label>
                  <input
                    className="mt-2 w-full border border-emerald-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Supplier name"
                    value={formData.supplier}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700">Location</label>
                  <input
                    className="mt-2 w-full border border-emerald-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Warehouse location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  className="flex-[2] bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl"
                >
                  Add Inventory Item
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
              <h2 className="text-2xl font-bold text-white">Adjust Stock</h2>
              <p className="text-blue-100 text-sm">{selectedItem.name}</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
                <select
                  value={adjustData.type}
                  onChange={(e) => setAdjustData({ ...adjustData, type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="in">Stock In</option>
                  <option value="out">Stock Out</option>
                  <option value="adjust">Adjust</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity</label>
                <input
                  type="number"
                  min="0"
                  value={adjustData.quantity}
                  onChange={(e) => setAdjustData({ ...adjustData, quantity: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Reason</label>
                <input
                  type="text"
                  value={adjustData.reason}
                  onChange={(e) => setAdjustData({ ...adjustData, reason: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setSelectedItem(null)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdjust}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}