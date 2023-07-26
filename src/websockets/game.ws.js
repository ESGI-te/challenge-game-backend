const SecurityService = require("../services/security.service");
const GameService = require("../services/game.service");
const { WS_GAME_NAMESPACE } = require("../utils/constants");

module.exports = function (io) {
  const gameService = GameService();
  const securityService = SecurityService();

  const namespace = io.of(WS_GAME_NAMESPACE);

  const gameStatuses = new Map();
  const remainingTimes = new Map();

  const getRemainingTime = (gameId) => {
    const remaining = remainingTimes.get(gameId);
    console.log(`Getting remaining time for game ${gameId}:`, remaining);
    return remaining;
  };

  const decrementRemainingTime = (gameId) => {
    if (remainingTimes.has(gameId)) {
      remainingTimes.set(gameId, remainingTimes.get(gameId) - 1);
    }
  };

  const startGame = async (game) => {
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
      {
        id: 5,
        question:
          "Quel peintre, né en 1844, est également appelé par beaucoup le Douanier ?",
        propositions: [
          "Henri Rousseau",
          "Salvador Dali",
          "Pablo Picasso",
          "Edgar Degas",
        ],
        answer: "Henri Rousseau",
        anecdote:
          "Le premier portrait connu réalisé par le peintre Henri Rousseau semble être celui de sa première femme.",
      },
      {
        id: 6,
        question:
          "Quel personnage imaginaire fut popularisé par le roman de E.R. Burroughs et par le cinéma ?",
        propositions: ["Nessie", "Le Yéti", "King-Kong", "Tarzan"],
        answer: "Tarzan",
        anecdote:
          "Edgar Rice Burroughs a inspiré bon nombre d'auteurs de science-fiction et de fantastique ainsi que de nombreux réalisateurs.",
      },
      {
        id: 7,
        question:
          "Quelle est la seule valeur à la roulette à porter la couleur verte ?",
        propositions: ["Treize", "Cinquante", "Zéro", "Quarante"],
        answer: "Zéro",
        anecdote:
          "À la roulette, lorsque le croupier donne la main, chaque joueur mise sur un numéro qu'il espère être tiré pour remporter la mise.",
      },
    ];

    console.log("Starting game", game._id);
    if (gameStatuses.get(game._id)) return;
    gameStatuses.set(game._id, true);
    remainingTimes.set(game._id, 15);
    console.log(
      "Set remaining time for game",
      game._id,
      ":",
      remainingTimes.get(game._id)
    );

    if (remainingTimes.get(game._id) === undefined) {
      console.error("Could not set remaining time for game", game._id);
    }

    const firstQuestion = await gameService.setCurrentQuestion(
      game._id,
      allQuizzes[0]
    );
    namespace.to(game._id).emit("question", firstQuestion);

    let questionIndex = 1;

    const interval = setInterval(async () => {
      try {
        decrementRemainingTime(game._id);
        const remainingTime = getRemainingTime(game._id);
        namespace.to(game._id).emit("remaining_time", remainingTime);

        if (remainingTime <= 0) {
          if (questionIndex < allQuizzes.length) {
            remainingTimes.set(game._id, 15); // Reset the remaining time to 15
            const questionData = {
              ...allQuizzes[questionIndex],
              remainingTime: getRemainingTime(game._id),
            };
            const currentQuestion = await gameService.setCurrentQuestion(
              game._id,
              questionData
            );
            namespace.to(game._id).emit("question", currentQuestion);
            questionIndex += 1;
          } else {
            clearInterval(interval);
            const winner = await Promise.race([
              gameService.getWinner(game._id),
              new Promise((_, reject) =>
                setTimeout(
                  () => reject(new Error("Getting winner took too long")),
                  1000
                )
              ),
            ]);
            namespace.to(game._id).emit("game_over", winner);
          }
        }
      } catch (err) {
        console.error(err);
        clearInterval(interval);
      }
    }, 1000); // changed this from 15*1000 to 1000 for every second emit.

    namespace.to(game._id).emit("remaining_time", getRemainingTime(game._id));
  };

  const handleConnection = async (socket) => {
    const code = socket.handshake.query["code"];
    const { token } = socket.handshake.auth;
    const user = await securityService.getUserFromToken(token);
    const game = await gameService.findOneByCode(code);

    if (!game) return;
    if (game.isStarted) {
      const currentQuestion = await gameService.getCurrentQuestion(game._id);
      socket.emit("question", currentQuestion);

      // Emit the remaining time immediately after the socket connects
      socket.emit("remaining_time", getRemainingTime(game._id));
    }
    const players = await gameService.addPlayer(game._id, user);
    if (!game.isStarted && !gameStatuses.get(game._id)) {
      await gameService.startGame(game._id);
      startGame(game);
    }
    socket.join(game._id);

    namespace.to(game._id).emit("notification", {
      title: "Someone's here",
      description: `${user.username} just joined the game`,
    });
    namespace.to(game._id).emit("players", players);

    if (game.isStarted) {
      const currentQuestion = await gameService.getCurrentQuestion(game._id);
      socket.emit("question", currentQuestion);

      socket.emit("remaining_time", getRemainingTime(game._id));
    }

    socket.on("answer", async ({ questionId, answer }) => {
      try {
        const isCorrect = await gameService.checkAnswer(
          game._id,
          questionId,
          answer
        );
        if (isCorrect) {
          await gameService.incrementScore(game._id, user._id);
        } else {
          await gameService.decrementLives(game._id, user._id);
          const lives = await gameService.getLives(game._id, user._id);
          if (lives === 0) {
            socket.emit("eliminated");
            socket.leave(game._id);
            await gameService.eliminatePlayer(game._id, user._id);
            namespace.to(game._id).emit("player_eliminated", user.username);
          }
        }
      } catch (error) {
        console.error("Error while processing answer:", error);
      }
      if (game.players.length === 0) {
        gameStatuses.set(game._id, false);
      }
    });

    socket.on("reconnect", async () => {
      if (game.isStarted) {
        const currentQuestionData = {
          ...(await gameService.getCurrentQuestion(game._id)),
          remainingTime: getRemainingTime(game._id),
        };
        socket.emit("question", currentQuestionData);

        socket.emit("remaining_time", getRemainingTime(game._id));
      }
    });

    socket.on("disconnect", async () => {
      const players = await gameService.removePlayer(game._id, user._id);
      namespace.to(game._id).emit("players", players);
      namespace.to(game._id).emit("notification", {
        title: "Someone just left",
        description: `${user.username} just left the game`,
      });
      if (game.players.length === 0) {
        gameStatuses.set(game._id, false);
      }
    });
  };

  namespace.on("connection", handleConnection);
};
