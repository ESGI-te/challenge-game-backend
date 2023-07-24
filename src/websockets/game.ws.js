const SecurityService = require("../services/security.service");
const GameService = require("../services/game.service");
const { WS_GAME_NAMESPACE } = require("../utils/constants");

module.exports = function (io) {
  const gameService = GameService();
  const securityService = SecurityService();

  const namespace = io.of(WS_GAME_NAMESPACE);

  const handleConnection = async (socket) => {
    const gameId = socket.handshake.query["gameId"];
    const { token } = socket.handshake.auth;
    const user = await securityService.getUserFromToken(token);
    const game = await gameService.addPlayer(gameId, {
      _id: user._id,
      username: user.username,
      score: 0,
      lives: 3,
    });
    const updatedGame = await gameService.findOne(gameId);

    socket.join(gameId);

    // console.log(updatedGame);
    namespace.to(gameId).emit("notification", {
      title: "Someone's here",
      description: `${user.username} just joined the game`,
    });
    if (updatedGame && updatedGame.user) {
      namespace.to(gameId).emit("user", updatedGame.user);
    }

    socket.on("answer", async ({ questionId, answer }) => {
      const isCorrect = await gameService.checkAnswer(
        gameId,
        questionId,
        answer
      );
      if (isCorrect) {
        await gameService.incrementScore(gameId, user._id, 1);
      } else {
        await gameService.decrementLives(gameId, user._id);
        const lives = await gameService.getLives(gameId, user._id);
        if (lives === 0) {
          socket.emit("eliminated");
          socket.leave(gameId);
          const updatedGame = await gameService.eliminatePlayer(
            gameId,
            user._id
          );
          namespace.to(gameId).emit("player_eliminated", user.username);
        }
      }
    });

    socket.on("start_game", async () => {
      const updatedGame = await gameService.findOne(gameId);
      startGame(gameId, updatedGame);
    });

    const startGame = async (gameId, updatedGame) => {
      const themes = await gameService.getQuestionsForPopularTheme(gameId);

      let allQuizzes = [];
      themes.forEach((theme) => {
        for (const level in theme.quizz) {
          allQuizzes = allQuizzes.concat(theme.quizz[level]);
        }
      });

      let question = allQuizzes[0];
      console.log("First question: ", question);
      namespace.to(gameId).emit("question", question.question);

      let questionIndex = 1;

      const interval = setInterval(async () => {
        if (questionIndex < allQuizzes.length) {
          question = allQuizzes[questionIndex];
          console.log("Next question: ", question);
          namespace.to(gameId).emit("question", question.question);
          questionIndex += 1;
        } else {
          clearInterval(interval);
          const winner = await gameService.getWinner(gameId);
          namespace.to(gameId).emit("game_over", winner);
        }
      }, updatedGame.settings.questionTime * 1000);
    };
    socket.on("disconnect", async () => {
      socket.leave(gameId);
      const updatedGame = await gameService.removePlayer(gameId, {
        _id: user._id,
        username: user.username,
      });
      namespace.to(gameId).emit("notification", {
        title: "Someone just left",
        description: `${user.username} just left the game`,
      });
      namespace.to(gameId).emit("players", updatedGame.players);
    });
  };

  namespace.on("connection", handleConnection);
};
