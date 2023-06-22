const { connection } = require("./db");

const mode = process.argv[2] ?? "alter";

connection
	.sync({ [mode]: true })
	.then(() => {
		console.log("Database synchronized");
		return connection.close();
	})
	.then(() => process.exit(0))
	.catch((error) => {
		console.error("Unable to synchronize the database:", error);
		process.exit(1);
	});
