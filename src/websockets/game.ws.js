const SecurityService = require("../services/security.service");
const GameService = require("../services/game.service");
const GameStatsService = require("../services/gameStats.service");
const { WS_GAME_NAMESPACE } = require("../utils/constants");
const QUESTION_TIME_LIMIT = 10;
class GameServer {
  constructor(io) {
    this.io = io;
    this.gameStatsService = GameStatsService();
    this.gameService = GameService();
    this.securityService = SecurityService();
    this.namespace = this.io.of(WS_GAME_NAMESPACE);
    this.gameStatuses = new Map();
    this.remainingTimes = new Map();
    this.playersBeforeLastRemoval = new Map();
    this.allPlayersMap = new Map();
    this.connectedPlayers = new Map();
    this.gameScores = new Map();
    this.backupRemainingTimes = new Map();

    this.activeConnections = new Map();
    this.namespace.on("connection", this.handleConnection.bind(this));
  }

  getRemainingTime(gameId) {
    const remaining = this.remainingTimes.get(gameId);
    const backupRemaining = this.backupRemainingTimes.get(gameId);

    if (typeof remaining === "undefined") {
      console.error(
        `Error: Remaining time for game ${gameId} is undefined. Using backup value: ${backupRemaining}`
      );
      if (typeof backupRemaining === "undefined") {
        console.error(
          `Both main and backup remaining times for game ${gameId} are undefined!`
        );
        return;
      }
      return backupRemaining;
    }
    return remaining;
  }

  decrementRemainingTime(gameId) {
    // Décrémenter la valeur principale
    if (this.remainingTimes.has(gameId)) {
      let newTime = this.remainingTimes.get(gameId) - 1;
      this.remainingTimes.set(gameId, newTime);
    }

    // Décrémenter la valeur de secours
    if (this.backupRemainingTimes.has(gameId)) {
      let backupNewTime = this.backupRemainingTimes.get(gameId) - 1;
      this.backupRemainingTimes.set(gameId, backupNewTime);
    } else {
      // Si backupRemainingTimes n'a pas encore de valeur pour ce gameId, on peut initialiser avec une valeur.
      this.backupRemainingTimes.set(gameId, QUESTION_TIME_LIMIT);
    }

    console.log(
      `Remaining time for game ${gameId}: ${this.remainingTimes.get(
        gameId
      )}, Backup remaining time: ${this.backupRemainingTimes.get(gameId)}`
    );
  }

  async startGame(game) {
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
      },
      {
        id: 6,
        question:
          "Quel personnage imaginaire fut popularisé par le roman de E.R. Burroughs et par le cinéma ?",
        propositions: ["Nessie", "Le Yéti", "King-Kong", "Tarzan"],
        answer: "Tarzan",
      },
      {
        id: 7,
        question:
          "Quelle est la seule valeur à la roulette à porter la couleur verte ?",
        propositions: ["Treize", "Cinquante", "Zéro", "Quarante"],
        answer: "Zéro",
      },
      {
        id: 8,
        question:
          "Quelle est la race du chien de Columbo, l'inspecteur obstiné et perspicace de la télé ?",
        propositions: ["Barbet", "Bichon", "Beagle", "Basset"],
        answer: "Basset",
      },
      {
        id: 9,
        question:
          "Quelle est la plus petite unité de mémoire utilisable sur un ordinateur ?",
        propositions: ["Byte", "Giga", "Bit", "Méga"],
        answer: "Bit",
      },
      {
        id: 10,
        question:
          "Dans le langage familier, comment appelle-t-on la dent du petit enfant ?",
        propositions: ["Marmotte", "Bouillotte", "Quenotte", "Menotte"],
        answer: "Quenotte",
      },
      {
        id: 11,
        question:
          "Où se situe la célèbre base navale américaine de Guantanamo, réputée pour sa sévérité ?",
        propositions: ["Mexique", "Cuba", "Paraguay", "Hawaii"],
        answer: "Cuba",
      },
      {
        id: 12,
        question:
          "Quelle est la spécialité du sportif tunisien Oussama Mellouli ?",
        propositions: ["Football", "Natation", "Marathon", "Boxe"],
        answer: "Natation",
      },
      {
        id: 13,
        question:
          "Quel acteur français a remporté le premier rôle dans le film « Le Guépard » ?",
        propositions: [
          "Jean Reno",
          "Claude Brasseur",
          "Jean Gabin",
          "Alain Delon",
        ],
        answer: "Alain Delon",
      },
      {
        id: 14,
        question:
          "Qui était le compagnon de Paul de Tarse, désigné aussi sous le nom de saint Paul ?",
        propositions: [
          "Saint Matthieu",
          "Saint Marc",
          "Saint Luc",
          "Saint Jean",
        ],
        answer: "Saint Luc",
      },
      {
        id: 15,
        question:
          "Quel titre de noblesse est immédiatement inférieur à celui de comte ?",
        propositions: ["Archiduc", "Duc", "Marquis", "Vicomte"],
        answer: "Vicomte",
      },
      {
        id: 16,
        question:
          "Quelle est la capitale de la Nouvelle-Zélande, au sud-ouest de l'océan Pacifique ?",
        propositions: ["Auckland", "Wellington", "Dublin", "Sydney"],
        answer: "Wellington",
      },
      {
        id: 17,
        question:
          "Quel film a réuni sur les écrans Isabelle Adjani et Sharon Stone ?",
        propositions: [
          "Les sorcières",
          "Les ensorceleuses",
          "Diabolique",
          "Ange et Démon",
        ],
        answer: "Diabolique",
      },
      {
        id: 18,
        question: "Comment est également appelée la Transat Jacques Vabre ?",
        propositions: [
          "Vendée Globe",
          "Route du rhum",
          "Route du café",
          "Trophée du rhum",
        ],
        answer: "Route du café",
      },
      {
        id: 19,
        question:
          "Quel oiseau vivant dans l'hémisphère nord nage le plus vite ?",
        propositions: ["Pingouin", "Bécassine", "Pie", "Martinet"],
        answer: "Pingouin",
      },
      {
        id: 20,
        question:
          "Quelle est la plus grosse des planètes de notre Système solaire ?",
        propositions: ["Neptune", "Saturne", "Jupiter", "Uranus"],
        answer: "Jupiter",
      },
      {
        id: 21,
        question:
          "Apparu il y a 450 millions d'années, à quelle classe animale le scorpion appartient-il ?",
        propositions: ["Arachnides", "Reptiles", "Mammifères", "Insectes"],
        answer: "Arachnides",
      },
      {
        id: 22,
        question:
          "Quel frère d'une actrice prénommée Mary a réalisé le film « La fièvre du samedi soir » ?",
        propositions: [
          "John Payne",
          "John Remezick",
          "John Travolta",
          "John Badham",
        ],
        answer: "John Badham",
      },
      {
        id: 23,
        question: "Au Moyen Âge, comment appelait-on un village fortifié ?",
        propositions: ["Tour", "Bastide", "Rempart", "Château fort"],
        answer: "Bastide",
      },
      {
        id: 24,
        question:
          "Quelle ville du Kent est célèbre pour sa source miraculeuse ?",
        propositions: ["Dartford", "Tunbridge Wells", "Gillingham", "Ramsgate"],
        answer: "Tunbridge Wells",
      },
      {
        id: 25,
        question:
          "Quel apéritif à base de vin est aromatisé avec des plantes amères et toniques ?",
        propositions: ["Vermouth", "Gentiane", "Kokebok", "Piccolo"],
        answer: "Vermouth",
      },
      {
        id: 26,
        question:
          "À quel écrivain, membre de l'Académie française, doit-on le roman intitulé « Le sagouin » ?",
        propositions: ["Giono", "Barjavel", "Mauriac", "Camus"],
        answer: "Mauriac",
      },
      {
        id: 27,
        question:
          "Quel président Français trouva la mort dans une situation inhabituelle ?",
        propositions: [
          "René Coty",
          "Félix Faure",
          "Georges Pompidou",
          "Raymond Poincaré",
        ],
        answer: "Félix Faure",
      },
      {
        id: 28,
        question:
          "Comment appelle-t-on le versant de la montagne non situé au soleil ?",
        propositions: ["Ressac", "Étant", "Adret", "Ubac"],
        answer: "Ubac",
      },
      {
        id: 29,
        question:
          "Quel oiseau palmipède a pour particularité de construire un nid flottant ?",
        propositions: ["Grèle", "Grèbe", "Grène", "Grève"],
        answer: "Grèbe",
      },
      {
        id: 30,
        question:
          "Un bédane, qui doit son nom à sa ressemblance avec un bec de canard, est un outil proche du...",
        propositions: ["Ciseau à bois", "Vilebrequin", "Rabot", "Maillet"],
        answer: "Ciseau à bois",
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
    if (!this.backupRemainingTimes.has(game._id)) {
      this.backupRemainingTimes.set(game._id, QUESTION_TIME_LIMIT);
    }
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

        if (remainingTime <= 0) {
          if (questionIndex < allQuizzes.length) {
            this.remainingTimes.set(game._id, QUESTION_TIME_LIMIT);
            const questionData = {
              ...allQuizzes[questionIndex],
              remainingTime: this.getRemainingTime(game._id),
              backupRemainingTime: this.backupRemainingTimes.get(game._id),
            };
            const currentQuestion = await this.gameService.setCurrentQuestion(
              game._id,
              questionData
            );
            this.namespace.to(game._id).emit("question", currentQuestion);
            questionIndex += 1;
          } else {
            clearInterval(interval);

            const winners = await this.gameService.getWinner(game._id);
            console.log("voici le score end game", winners);
            this.namespace.to(game._id).emit("game_over", winners);

            const alivePlayers = await this.gameService.getAlivePlayers(
              game._id
            );
            console.log("aliveplayer", alivePlayers);
          }
        } else {
          this.namespace.to(game._id).emit("remaining_time", remainingTime);
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
      this.namespace
        .to(game._id)
        .emit("remaining_time", this.getRemainingTime(game._id));
    } else if (!this.gameStatuses.get(game._id)) {
      await this.gameService.startGame(game._id);
      this.startGame(game);
    }

    socket.on("request_remaining_time", async () => {
      try {
        const remainingTime = this.getRemainingTime(game._id);
        if (typeof remainingTime === "undefined") {
          console.error(`No remaining time for game ${game._id}`);
          socket.emit("remaining_time", QUESTION_TIME_LIMIT);
        } else {
          socket.emit("remaining_time", remainingTime);
        }
      } catch (error) {
        console.error("Error fetching remaining time:", error);
      }
    });

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
          backupRemainingTime: this.backupRemainingTimes.get(game._id),
        };
        socket.emit("question", currentQuestionData);
        console.log(currentQuestionData);
        this.namespace
          .to(game._id)
          .emit("remaining_time", this.getRemainingTime(game._id));

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
        const allPlayers = await this.gameService.getAllPlayers(game._id);
        let existingPlayers = this.playersBeforeLastRemoval.get(game._id) || [];

        const playerBeingRemoved = {
          username: user.username,
          id: user._id,
          score: user.score,
          lives: user.lives,
        };

        let playerMap = new Map(
          [...existingPlayers, playerBeingRemoved].map((player) => [
            player.id.toString(),
            player,
          ])
        );
        allPlayers.forEach((player) => {
          playerMap.set(player.id.toString(), player);
        });

        let combinedPlayers = [...playerMap.values()];

        console.log("All players before last removal:", combinedPlayers);

        console.log(
          "Debug - playersBeforeLastRemoval:",
          this.playersBeforeLastRemoval.get(game._id)
        );
        const playersAfterRemoval = await this.gameService.removePlayer(
          game._id,
          user._id
        );
        console.log("Players after removal:", playersAfterRemoval);

        this.namespace.to(game._id).emit("players", combinedPlayers);
        console.log("combinedPlayers", combinedPlayers);

        if (playersAfterRemoval.length === 0) {
          console.log("All players:", combinedPlayers);
          const rankedPlayers = this.gameService.rankPlayers(combinedPlayers);

          console.log("Ranked players:", rankedPlayers);

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

          this.playersBeforeLastRemoval.delete(game._id);
          this.gameStatuses.delete(game._id);
        } else {
          this.playersBeforeLastRemoval.set(game._id, combinedPlayers);
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
