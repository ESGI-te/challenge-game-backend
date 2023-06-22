const express = require("express");
const app = express();
const genericCRUDRouter = require("./routes/genericRouter");
const GenericController = require("./controllers/generic.controller");
const errorsHandler = require("./middlewares/errorHandler");
const UserService = require("./services/user.service");

app.use(express.json());

app.use(
	"/users",
	new genericCRUDRouter(new GenericController(new UserService()))
);

app.get("/", (req, res) => {
	res.send("Hello World!");
});

app.post("/", (req, res) => {
	console.log(req.body);
	res.send("Got a POST request");
});

app.use(errorsHandler);

app.listen(3000, () => {
	console.log("Example app listening on port 3000!");
});
