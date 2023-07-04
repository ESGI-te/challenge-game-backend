const express = require("express");
const app = express();
const UserRouter = require("./routes/user.router");
const QuizzRouter = require("./routes/quizz.router");
const BoutiqueRouter = require("./routes/boutique.router");
const errorsHandler = require("./middlewares/errorHandler");
const dotenv = require("dotenv");

const stripe = require('stripe')(process.env.STRIPE_KEY);


dotenv.config();

const db = require("./db");
const connection = db();

app.use(express.json());

app.use("/users", new UserRouter());

app.use("/quizzs", new QuizzRouter());

app.use("/boutique", new BoutiqueRouter())

app.get("/", (req, res) => {
	res.send("Hello World!");
});

app.post("/", (req, res) => {
	console.log(req.body);
	res.send("Got a POST request");
});

app.get("/is-mongoose-ok", function (req, res) {
	if (mongoose) {
		res.json({ isMongooseOk: !!mongoose.connection.readyState });
	} else {
		res.json({ isMongooseOk: false });
	}
});

app.use(errorsHandler);

app.listen(3000, () => {
	console.log("Example app listening on port 3000!");
});
