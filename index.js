const express = require("express");
const cors = require("cors");

const UserRouter = require("./src/routes/user.router");
const QuizzRouter = require("./src/routes/quizz.router");
const QuizzThemeRouter = require("./src/routes/quizzTheme.router");
const GameRouter = require("./src/routes/game.router");
const LobbyRouter = require("./src/routes/lobby.router");
const SecurityRouter = require("./src/routes/security.router");
const ShopRouter = require("./src/routes/shop.router");
const InventoryRouter = require("./src/routes/inventory.router");
const UserInvitationRouter = require("./src/routes/userInvitation.router");
const GameInvitationRouter = require("./src/routes/gameInvitation.router");
const GameStatsRouter = require("./src/routes/gameStats.router");
const HistoryRouter = require("./src/routes/history.router");
const StripeRouter = require("./src/routes/stripe.router.js");
const AchievementRouter = require("./src/routes/achievement.router.js");
const UserAchievementRouter = require("./src/routes/userAchievement.router.js");

const ThemePackRouter = require("./src/routes/quizzThemePack.router.js");

const GameSocket = require("./src/websockets/game.ws");
const LobbySocket = require("./src/websockets/lobby.ws");
const NotificationSocket = require("./src/websockets/notification.ws");
const FriendsSocket = require("./src/websockets/friends.ws");

const errorsHandler = require("./src/middlewares/errorHandler");
const authGuard = require("./src/middlewares/auth");

const dotenv = require("dotenv");
const wsAuthGuard = require("./src/middlewares/wsAuth");

const app = express();

const dayjs = require("dayjs");

dayjs().format();

dotenv.config();
require("./src/db")();

app.use(cors({ origin: "*" }));

const server = app.listen(process.env.PORT, () => {
	console.log(`App listening on port ${process.env.PORT}!`);
});

const io = require("./src/socket")(server);

io.use(wsAuthGuard);

NotificationSocket(io);
FriendsSocket(io);
GameSocket(io);
LobbySocket(io);

app.use(express.json());

app.use("/", SecurityRouter());

app.use(authGuard);

app.use("/users", UserRouter());
app.use("/payment", StripeRouter());
app.use("/shop", ShopRouter());
app.use("/inventory", InventoryRouter());
app.use("/quizzs", QuizzRouter());
app.use("/quizz-themes", QuizzThemeRouter());
app.use("/quizz-themes-packs", ThemePackRouter());
app.use("/games", GameRouter());
app.use("/lobbies", LobbyRouter());
app.use("/user-invitations", UserInvitationRouter());
app.use("/game-invitations", GameInvitationRouter());
app.use("/game-stats", GameStatsRouter());
app.use("/history", HistoryRouter());
app.use("/achievements", AchievementRouter());
app.use("/user-achievements", UserAchievementRouter());

app.use(errorsHandler);
