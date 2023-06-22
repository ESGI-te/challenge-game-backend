module.exports = function (Controller, options = {}) {
	const { Router } = require("express");
	const router = Router();

	router.get("/", Controller.getAll);
	router.post("/", Controller.create);

	router.get("/:id", Controller.getOne);
	router.put("/:id", Controller.replace);
	router.patch("/:id", Controller.update);
	router.delete("/:id", Controller.delete);

	return router;
};
