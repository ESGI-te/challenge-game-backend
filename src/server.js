const express = require("express");
const cors = require("cors");
const UserRouter = require("./routes/user.router");
const QuizzRouter = require("./routes/quizz.router");
const QuizzThemeRouter = require("./routes/quizzTheme.router");
const GameRouter = require("./routes/game.router");
const LobbyRouter = require("./routes/lobby.router");
const SecurityRouter = require("./routes/security.router");
const UserInvitationRouter = require("./routes/userInvitation.router");
const GameInvitationRouter = require("./routes/gameInvitation.router");
const GameStatsRouter = require('./routes/gameStats.router')
const HistoryRouter = require('./routes/history.router')

const GameSocket = require("./websockets/game.ws");
const LobbySocket = require("./websockets/lobby.ws");
const NotificationSocket = require("./websockets/notification.ws");
const FriendsSocket = require("./websockets/friends.ws");

const errorsHandler = require("./middlewares/errorHandler");
const authGuard = require("./middlewares/auth");

const dotenv = require("dotenv");
const wsAuthGuard = require("./middlewares/wsAuth");

const app = express();

const dayjs = require('dayjs');

dayjs().format();

dotenv.config();
require("./db")();

app.use(cors());

const server = app.listen(3000, () => {
  console.log("App listening on port 3000!");
});

const io = require("./socket")(server);

io.use(wsAuthGuard);

NotificationSocket(io);
FriendsSocket(io);
GameSocket(io);
LobbySocket(io);

app.use(express.json());

app.use("/", SecurityRouter());

app.use(authGuard);

app.use("/users", UserRouter());
app.use("/quizzs", QuizzRouter());
app.use("/quizz-themes", QuizzThemeRouter());
app.use("/games", GameRouter());
app.use("/lobbies", LobbyRouter());
app.use("/user-invitations", UserInvitationRouter());
app.use("/game-invitations", GameInvitationRouter());
app.use('/game-stats',GameStatsRouter());
app.use('/history',HistoryRouter())

app.use(errorsHandler);
