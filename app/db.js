const Sequelize = require("sequelize");
const fs = require("fs");
const path = require("path");
const connection = new Sequelize(process.env.DATABASE_URL);

connection
	.authenticate()
	.then(() => {
		console.log("Connection has been established successfully.");
	})
	.catch((error) => {
		console.error("Unable to connect to the database:", error);
	});

const db = { connection };

const files = fs.readdirSync(path.join(__dirname, "models"));
files.forEach((file) => {
	const model = require(path.join(__dirname, "models", file))(connection);
	db[model.name] = model;
});

module.exports = db;
