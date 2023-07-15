module.exports = function (options = {}) {
	const { Router } = require("express");
	const router = Router();
	const BoutiqueService = require("../services/boutique.service");
	const BoutiqueController = require("../controllers/boutique.controller");
	const controller = new BoutiqueController(new BoutiqueService());

	router.get("/", (req, res)=> {
		res.send('Boutique shop ! ');
	} );
	router.get("/produit/:id", (req, res) => {
		res.send('Boutique product !');
	});
	router.get("/produit/:id/payment", (req, res) => {
		res.send('Boutique product item : ');
	});
	router.post("/produit/:id", (req, res) => {
		res.send('Le nouveau produit a été créé avec succès.');
	});
	router.put("/produit/:id", (req, res) => {
		res.send('Le  produit a été modifié avec succès.');
	});
	router.post("/produit/testPaiement", (req, res) => {
		app.post('/paiement', controller.processPayment);
	});
  
	return router;
  };
  