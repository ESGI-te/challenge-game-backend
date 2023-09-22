module.exports = (options = {}) => {
	const { Router } = require("express");
	const router = Router();
	// Importer les services et les contrôleurs nécessaires
	const InventoryService = require("../services/inventory.service");
	const InventoryController = require("../controllers/inventory.controller.js");
	// Créer une instance du contrôleur en passant le service correspondant
	const controller = InventoryController(InventoryService());
	// Définir les routes et associer les méthodes du contrôleur aux routes correspondantes
	router.get("/themes", controller.getThemesByUser);
	router.get("/theme-packs", controller.getThemesPackByUser);
	router.post("/", controller.create);
	router.get("/", controller.getAll);
	router.get("/:id", controller.getOne);
	router.patch("/:id", controller.update);
	router.delete("/:id", controller.delete);

	return router;
  };
  