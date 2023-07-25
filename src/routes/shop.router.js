module.exports = (options = {}) => {
	const { Router } = require("express");
	const router = Router();
  
	// Importer les services et les contrôleurs nécessaires
	const ShopService = require("../services/shop.service");
	const ShopController = require("../controllers/shop.controller.js");
  
	// Créer une instance du contrôleur en passant le service correspondant
	const controller = ShopController(ShopService());
  
	// Définir les routes et associer les méthodes du contrôleur aux routes correspondantes
	router.get("/", controller.getAll);
	router.post("/products/:id", controller.create);
  
	router.get("/products/:id", controller.getOne);
	router.put("/products/:id", controller.replace);
	router.patch("/products/:id", controller.update);
	router.delete("/products/:id", controller.delete);
  
	return router;
  };
  