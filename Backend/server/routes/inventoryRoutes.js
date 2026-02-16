const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const inventoryController = require("../controllers/inventoryController");

router.use(authMiddleware);

// Admin-only routes (static paths before :id)
router.get("/stats", roleMiddleware("admin"), inventoryController.getInventoryStats);
router.get("/movements", roleMiddleware("admin"), inventoryController.getMovements);

// Read access for admin and engineer
router.get("/", roleMiddleware(["admin", "engineer"]), inventoryController.getItems);
router.get("/:id", roleMiddleware(["admin", "engineer"]), inventoryController.getItemById);
router.post("/", roleMiddleware("admin"), inventoryController.createItem);
router.patch("/:id", roleMiddleware("admin"), inventoryController.updateItem);
router.delete("/:id", roleMiddleware("admin"), inventoryController.deleteItem);
router.post("/:id/adjust", roleMiddleware("admin"), inventoryController.adjustStock);

module.exports = router;