const express = require("express");
const app = express();
const cors = require("cors");
const UserRouter = require("./routes/user.router");
const QuizzRouter = require("./routes/quizz.router");
const GameRouter = require("./routes/game.router");
const LobbyRouter = require("./routes/lobby.router");
const SecurityRouter = require("./routes/security.router");

const GameSocket = require("./websockets/game.ws");
const LobbySocket = require("./websockets/lobby.ws");

const errorsHandler = require("./middlewares/errorHandler");
const authGuard = require("./middlewares/auth");

const dotenv = require("dotenv");
const wsAuthGuard = require("./middlewares/WsAuth");
dotenv.config();
require("./db")();

app.use(cors());

const server = app.listen(3000, () => {
	console.log("App listening on port 3000!");
});

const io = require("./socket")(server);

io.use(wsAuthGuard);

GameSocket(io);
LobbySocket(io);

app.use(express.json());

app.use("/", new SecurityRouter());

app.use(authGuard);

app.use("/users", new UserRouter());
app.use("/quizzs", new QuizzRouter());
app.use("/games", new GameRouter());
app.use("/lobbies", new LobbyRouter());

app.use(errorsHandler);
