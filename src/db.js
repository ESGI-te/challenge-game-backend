const mongoose = require("mongoose");

const db = async () => {
	try {
		await mongoose.connect(process.env.DATABASE_URL);
		console.log("Database connection has been established successfully.");
	} catch (error) {
		console.error("Unable to connect to the database:", error);
	}
};

module.exports = db;
