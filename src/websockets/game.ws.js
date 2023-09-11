const SecurityService = require("../services/security.service");
const GameService = require("../services/game.service");
const GameStatsService = require("../services/gameStats.service");
const { WS_GAME_NAMESPACE } = require("../utils/constants");
const QUESTION_TIME_LIMIT = 4;

class GameServer {
  constructor(io) {
    this.io = io;
    this.gameStatsService = GameStatsService();
    this.gameService = GameService();
    this.securityService = SecurityService();
    this.namespace = this.io.of(WS_GAME_NAMESPACE);
    this.gameStatuses = new Map();
    this.remainingTimes = new Map();
    this.activeConnections = new Map();
    this.namespace.on("connection", this.handleConnection.bind(this));
  }

  getRemainingTime(gameId) {
    const remaining = this.remainingTimes.get(gameId);
    console.log(`Getting remaining time for game ${gameId}:`, remaining);
    return remaining;
  }

  decrementRemainingTime(gameId) {
    if (this.remainingTimes.has(gameId)) {
      this.remainingTimes.set(gameId, this.remainingTimes.get(gameId) - 1);
    }
  }

  async startGame(game) {
    ///test plus rapide
    const allQuizzes = [
      {
        id: 1,
        question:
          "Quel film à succès a réuni sur les écrans Sean Connery et Christophe Lambert ?",
        propositions: ["Subway", "Mad Max", "Highlander", "Greystoke"],
        answer: "Highlander",
        anecdote:
          "« A Kind of Magic » est un album du groupe Queen, sorti en juin 1986, dont six de ses neuf morceaux sont utilisés dans le film « Highlander ».",
      },
      {
        id: 2,
        question:
          "Quel pays, dont les premiers habitants étaient des Newars, a pour capitale Katmandou ?",
        propositions: ["Pakistan", "Népal", "Corée du Nord", "Tibet"],
        answer: "Népal",
        anecdote:
          "Katmandou est la capitale politique et religieuse du Népal ainsi que la plus grande ville du pays.",
      },
      {
        id: 3,
        question:
          "Dans quel film John Travolta incarne-t-il un ange tombé du ciel ?",
        propositions: ["Michael", "Sam", "Jerry", "Johnny"],
        answer: "Michael",
        anecdote:
          "Dans le film « Michael », deux journalistes enquêtent sur un soi-disant vrai ange vivant chez une dame âgée.",
      },
      {
        id: 4,
        question:
          "Pour quel auteur-compositeur-interprète aux 40 millions de disques Capri est-il fini ?",
        propositions: [
          "Serge Lama",
          "Charles Aznavour",
          "Salvatore Adamo",
          "Hervé Vilard",
        ],
        answer: "Hervé Vilard",
        anecdote:
          "Didier Barbelivien, Michel Fugain et Danyel Gérard ont fait partie de la liste des artistes qui ont composé pour Hervé Vilard.",
      },
    ];
    console.log("Starting game", game._id);
    if (this.gameStatuses.get(game._id)) return;
    this.gameStatuses.set(game._id, true);
    this.remainingTimes.set(game._id, QUESTION_TIME_LIMIT);
    console.log(
      "Set remaining time for game",
      game._id,
      ":",
      this.remainingTimes.get(game._id)
    );

    if (this.remainingTimes.get(game._id) === undefined) {
      console.error("Could not set remaining time for game", game._id);
    }

    const firstQuestion = await this.gameService.setCurrentQuestion(
      game._id,
      allQuizzes[0]
    );
    this.namespace.to(game._id).emit("question", firstQuestion);

    let questionIndex = 1;

    const interval = setInterval(async () => {
      try {
        if (!this.activeConnections.has(game._id)) {
          console.log(
            `No active connections for game ${game._id}. Not getting remaining time.`
          );
          clearInterval(interval);
          return;
        }
        this.decrementRemainingTime(game._id);
        const remainingTime = this.getRemainingTime(game._id);
        this.namespace.to(game._id).emit("remaining_time", remainingTime);

        if (remainingTime <= 0) {
          if (questionIndex < allQuizzes.length) {
            this.remainingTimes.set(game._id, QUESTION_TIME_LIMIT);
            const questionData = {
              ...allQuizzes[questionIndex],
              remainingTime: this.getRemainingTime(game._id),
            };
            const currentQuestion = await this.gameService.setCurrentQuestion(
              game._id,
              questionData
            );
            this.namespace.to(game._id).emit("question", currentQuestion);
            questionIndex += 1;
          } else {
            clearInterval(interval);

            const alivePlayers = await this.gameService.getAlivePlayers(
              game._id
            );
            console.log("aliveplayer", alivePlayers);
            if (alivePlayers.length <= 0) {
              const winners = await this.gameService.getWinner(game._id);
              console.log("voici le score end game", winners);
              this.namespace.to(game._id).emit("game_over", winners);
            }
          }
        }
      } catch (err) {
        console.error(err);
        clearInterval(interval);
      }
    }, 1000);
    this.namespace
      .to(game._id)
      .emit("remaining_time", this.getRemainingTime(game._id));
  }

  async handleConnection(socket) {
    const code = socket.handshake.query["code"];
    const { token } = socket.handshake.auth;
    const user = await this.securityService.getUserFromToken(token);
    const game = await this.gameService.findOneByCode(code);

    if (!game) return;
    if (!this.activeConnections.has(game._id)) {
      this.activeConnections.set(game._id, new Set());
    }
    this.activeConnections.get(game._id).add(user._id);
    const players = await this.gameService.addPlayer(game._id, user);

    socket.join(game._id);

    this.namespace.to(game._id).emit("notification", {
      title: "Someone's here",
      description: `${user.username} just joined the game`,
    });

    this.namespace.to(game._id).emit("players", players);

    if (game.isStarted) {
      const currentQuestion = await this.gameService.getCurrentQuestion(
        game._id
      );
      socket.emit("question", currentQuestion);
      socket.emit("remaining_time", this.getRemainingTime(game._id));
    } else if (!this.gameStatuses.get(game._id)) {
      await this.gameService.startGame(game._id);
      this.startGame(game);
    }

    socket.on("answer", async ({ questionId, answer }) => {
      try {
        const isCorrect = await this.gameService.checkAnswer(
          game._id,
          questionId,
          answer
        );
        const respondedQuickly = this.getRemainingTime(game._id) > 10;

        if (isCorrect) {
          await this.gameService.incrementScore(
            game._id,
            user._id,
            respondedQuickly
          );
          const updatedGame = await this.gameService.incrementScore(
            game._id,
            user._id,
            respondedQuickly
          );

          if (updatedGame.players && updatedGame.players.length > 0) {
            const updatedPlayer = updatedGame.players.find(
              (player) => player.id === user._id
            );

            if (updatedPlayer) {
              const updatedScore = updatedPlayer.score;
              this.namespace.to(game._id).emit("score_updated", {
                playerId: user._id,
                score: updatedScore,
              });
            } else {
              console.error("Player not found in updatedGame:", user._id);
            }
          } else {
            console.error("No players or empty players array in updatedGame");
          }
        } else {
          await this.gameService.decrementLives(game._id, user._id);
          const lives = await this.gameService.getLives(game._id, user._id);
          if (lives === 0) {
            socket.emit("eliminated");
            socket.leave(game._id);
            await this.gameService.eliminatePlayer(game._id, user._id);
            this.namespace
              .to(game._id)
              .emit("player_eliminated", user.username);
          }
        }
      } catch (error) {
        console.error("Error while processing answer:", error);
      }

      if (game && game.players.length === 0) {
        this.gameStatuses.set(game._id, false);
      }
    });
    socket.on("reconnect", async () => {
      if (game.isStarted) {
        const currentQuestionData = {
          ...(await this.gameService.getCurrentQuestion(game._id)),
          remainingTime: this.getRemainingTime(game._id),
        };
        socket.emit("question", currentQuestionData);
        console.log(currentQuestionData);
        socket.emit("remaining_time", this.getRemainingTime(game._id));
        const currentScore = await this.gameService.getCurrentScore(
          game._id,
          user._id
        );
        socket.emit("score", currentScore);
      }
    });
    socket.on("disconnect", async () => {
      try {
        if (this.activeConnections.has(game._id)) {
          this.activeConnections.get(game._id).delete(user._id);
          if (this.activeConnections.get(game._id).size === 0) {
            this.activeConnections.delete(game._id);
          }
        }
        const players = await this.gameService.removePlayer(game._id, user._id);
        this.namespace.to(game._id).emit("players", players);
        this.namespace.to(game._id).emit("notification", {
          title: "Someone just left",
          description: `${user.username} just left the game`,
        });
        if (players.length === 0) {
          const sortedPlayers = await this.gameService.getAllPlayers(game._id);
          console.log("sortedplayer:", sortedPlayers);
          const rankedPlayers = await this.gameService.rankPlayers(
            sortedPlayers
          );
          const gameStatsData = {
            stats: rankedPlayers.map((player) => ({
              user: {
                id: player.id,
                username: player.username,
              },
              rank: player.rank,
              score: player.score,
              lives: player.lives,
            })),
          };
          const savedStats = await this.gameStatsService.create(gameStatsData);
          console.log("Game statistics saved successfully:", savedStats);
          this.gameStatuses.delete(game._id);
        }
      } catch (error) {
        console.error("Error handling disconnect:", error);
      }
    });
  }
}

module.exports = function (io) {
  new GameServer(io);
};
