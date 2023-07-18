module.exports = (options = {}) => {
	const { Router } = require("express");
	const router = Router();
  
	// Importer les services et les contrôleurs nécessaires
	const ShopService = require("../services/shop.service");
	const ShopController = require("../controllers/shop.controller.js");
  
	// Créer une instance du contrôleur en passant le service correspondant
	const controller = ShopController(ShopController());
  
	// Définir les routes et associer les méthodes du contrôleur aux routes correspondantes
	router.get("/", controller.getAll);
	router.post("/", controller.create);
  
	router.get("/:id", controller.getOne);
	router.put("/:id", controller.replace);
	router.patch("/:id", controller.update);
	router.delete("/:id", controller.delete);
  
	return router;
  };
  