const InventoryItem = require("../models/InventoryItem");
const InventoryMovement = require("../models/InventoryMovement");

const buildItemFilter = (query) => {
  const filter = {};
  if (query.category) filter.category = query.category;
  if (query.status) filter.status = query.status;
  if (query.search) {
    const regex = new RegExp(query.search, "i");
    filter.$or = [{ name: regex }, { sku: regex }, { brand: regex }, { model: regex }];
  }
  if (query.lowStock === "true") {
    filter.$expr = {
      $and: [
        { $gt: ["$minStock", 0] },
        { $lte: ["$stockOnHand", "$minStock"] },
      ],
    };
  }
  return filter;
};

const getAvailableStock = (item) => {
  return Math.max(0, (item.stockOnHand || 0) - (item.reservedStock || 0));
};

exports.createItem = async (req, res) => {
  try {
    const item = await InventoryItem.create(req.body);
    res.status(201).json(item);
  } catch (error) {
    console.error("CREATE INVENTORY ITEM ERROR:", error);
    res.status(500).json({
      message: "Failed to create inventory item",
      error: error.message,
    });
  }
};

exports.getItems = async (req, res) => {
  try {
    const filter = buildItemFilter(req.query);
    const items = await InventoryItem.find(filter).sort({ createdAt: -1 });
    res.json(items.map((item) => ({
      ...item.toObject(),
      availableStock: getAvailableStock(item),
    })));
  } catch (error) {
    console.error("GET INVENTORY ITEMS ERROR:", error);
    res.status(500).json({
      message: "Failed to fetch inventory items",
      error: error.message,
    });
  }
};

exports.getItemById = async (req, res) => {
  try {
    const item = await InventoryItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.json({
      ...item.toObject(),
      availableStock: getAvailableStock(item),
    });
  } catch (error) {
    console.error("GET INVENTORY ITEM ERROR:", error);
    res.status(500).json({
      message: "Failed to fetch inventory item",
      error: error.message,
    });
  }
};

exports.updateItem = async (req, res) => {
  try {
    const item = await InventoryItem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.json(item);
  } catch (error) {
    console.error("UPDATE INVENTORY ITEM ERROR:", error);
    res.status(500).json({
      message: "Failed to update inventory item",
      error: error.message,
    });
  }
};

exports.deleteItem = async (req, res) => {
  try {
    const item = await InventoryItem.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.json({ message: "Item deleted" });
  } catch (error) {
    console.error("DELETE INVENTORY ITEM ERROR:", error);
    res.status(500).json({
      message: "Failed to delete inventory item",
      error: error.message,
    });
  }
};

exports.adjustStock = async (req, res) => {
  try {
    const { type, quantity, reason, referenceType, referenceId, newStock } = req.body;

    const item = await InventoryItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    const beforeStock = item.stockOnHand || 0;
    let updatedStock = beforeStock;
    let movementQty = Number(quantity || 0);

    if (type === "in") {
      updatedStock = beforeStock + movementQty;
    } else if (type === "out") {
      updatedStock = beforeStock - movementQty;
    } else if (type === "adjust") {
      if (typeof newStock === "number") {
        updatedStock = newStock;
        movementQty = newStock - beforeStock;
      } else {
        updatedStock = beforeStock + movementQty;
      }
    } else {
      return res.status(400).json({ message: "Invalid adjustment type" });
    }

    if (updatedStock < 0) {
      return res.status(400).json({ message: "Stock cannot be negative" });
    }

    item.stockOnHand = updatedStock;
    await item.save();

    await InventoryMovement.create({
      item: item._id,
      type,
      quantity: movementQty,
      reason,
      performedBy: req.user?.id,
      referenceType,
      referenceId,
      beforeStock,
      afterStock: updatedStock,
    });

    res.json({
      message: "Stock updated",
      item,
    });
  } catch (error) {
    console.error("ADJUST STOCK ERROR:", error);
    res.status(500).json({
      message: "Failed to adjust stock",
      error: error.message,
    });
  }
};

exports.getMovements = async (req, res) => {
  try {
    const { itemId } = req.query;
    const filter = itemId ? { item: itemId } : {};
    const movements = await InventoryMovement.find(filter)
      .populate("item", "name sku")
      .populate("performedBy", "name email")
      .sort({ createdAt: -1 })
      .limit(200);

    res.json(movements);
  } catch (error) {
    console.error("GET MOVEMENTS ERROR:", error);
    res.status(500).json({
      message: "Failed to fetch movements",
      error: error.message,
    });
  }
};

exports.getInventoryStats = async (req, res) => {
  try {
    const items = await InventoryItem.find();
    const lowStockItems = items.filter(
      (i) => i.minStock > 0 && i.stockOnHand <= i.minStock
    );

    const totalStockValue = items.reduce(
      (sum, i) => sum + (i.costPrice || 0) * (i.stockOnHand || 0),
      0
    );

    const byCategory = items.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {});

    res.json({
      totalItems: items.length,
      lowStock: lowStockItems.length,
      totalStockValue,
      byCategory,
    });
  } catch (error) {
    console.error("GET INVENTORY STATS ERROR:", error);
    res.status(500).json({
      message: "Failed to fetch inventory stats",
      error: error.message,
    });
  }
};