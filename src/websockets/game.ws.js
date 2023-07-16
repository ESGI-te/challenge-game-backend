const SecurityService = require("../services/security.service");
const GameService = require("../services/game.service");
const { WS_GAME_NAMESPACE } = require("../utils/constants");

module.exports = function (io) {
  const gameService = GameService();
  const securityService = SecurityService();

  const namespace = io.of(WS_GAME_NAMESPACE);

  const handleConnection = async (socket) => {
    const gameId = socket.handshake.query["gameId"];
    const userId = socket.handshake.query["userId"];
    const token = socket.handshake.auth.token;

    const player = await securityService.getUserFromToken(token);
    const game = await gameService.addPlayer(gameId, {
      id: userId,
      username: player.username,
    });

    socket.join(gameId);

    namespace.to(gameId).emit("notification", {
      title: "Someone's here",
      description: `${player.username} just joined the game`,
    });
    namespace.to(gameId).emit("players", game.players);

    socket.on("answer", async ({ questionId, answer }) => {
      const isCorrect = await gameService.checkAnswer(
        gameId,
        questionId,
        answer
      );
      if (isCorrect) {
        await gameService.incrementScore(gameId, userId, 1);
      } else {
        await gameService.decrementLives(gameId, userId);
        const lives = await gameService.getLives(gameId, userId);
        if (lives === 0) {
          socket.emit("eliminated");
          socket.leave(gameId);
          const updatedGame = await gameService.eliminatePlayer(gameId, userId);
          namespace.to(gameId).emit("player_eliminated", player.username);
        }
      }
    });

    socket.on("vote_category", async ({ category }) => {
      await gameService.voteCategory(gameId, userId, category);
      const votedCategories = await gameService.getVotedCategories(gameId);
      namespace.to(gameId).emit("voted_categories", votedCategories);

      const playersCount = game.players.length;
      const votedPlayersCount = votedCategories.length;

      if (playersCount === votedPlayersCount || hasReachedTimeout()) {
        const winningCategory = await gameService.getWinningCategory(gameId);
        namespace.to(gameId).emit("category_chosen", winningCategory);
        await startGame(gameId);
      }
    });

    const hasReachedTimeout = () => {
      const votingTimeout = 45 * 1000;
      const elapsedTime = new Date() - game.currentQuestionStartTime;
      return elapsedTime >= votingTimeout;
    };

    const startGame = async (gameId) => {
      let question = await gameService.getNextQuestion(gameId);
      namespace.to(gameId).emit("question", question);

      const interval = setInterval(async () => {
        question = await gameService.getNextQuestion(gameId);
        if (question) {
          namespace.to(gameId).emit("question", question);
        } else {
          const alivePlayers = await gameService.getAlivePlayers(gameId);
          if (alivePlayers.length > 1) {
            clearInterval(interval);
            namespace.to(gameId).emit("choose_category");
          } else {
            clearInterval(interval);
            const winner = gameService.getWinner(gameId);
            namespace.to(gameId).emit("game_over", winner);
          }
        }
      }, 30000);
    };

    socket.on("disconnect", async () => {
      socket.leave(gameId);
      const updatedGame = await gameService.removePlayer(gameId, {
        id: userId,
        username: player.username,
      });
      namespace.to(gameId).emit("notification", {
        title: "Someone just left",
        description: `${player.username} just left the game`,
      });
      namespace.to(gameId).emit("players", updatedGame.players);
    });
  };

  namespace.on("connection", handleConnection);
};
