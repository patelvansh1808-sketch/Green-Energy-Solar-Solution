const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const inventoryController = require("../controllers/inventoryController");

router.use(authMiddleware, roleMiddleware("admin"));

router.get("/stats", inventoryController.getInventoryStats);
router.get("/movements", inventoryController.getMovements);

router.post("/", inventoryController.createItem);
router.get("/", inventoryController.getItems);
router.get("/:id", inventoryController.getItemById);
router.patch("/:id", inventoryController.updateItem);
router.delete("/:id", inventoryController.deleteItem);

router.post("/:id/adjust", inventoryController.adjustStock);

module.exports = router;