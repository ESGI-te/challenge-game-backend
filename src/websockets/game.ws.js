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
    return remainingTimes.get(gameId);
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
      {
        id: 8,
        question:
          "Quelle est la race du chien de Columbo, l'inspecteur obstiné et perspicace de la télé ?",
        propositions: ["Barbet", "Bichon", "Beagle", "Basset"],
        answer: "Basset",
        anecdote:
          "Interrompue en 1978, la série télévisée « Columbo » a été ressuscitée en 1989, toujours avec Peter Falk dans le rôle principal.",
      },
      {
        id: 9,
        question:
          "Quelle est la plus petite unité de mémoire utilisable sur un ordinateur ?",
        propositions: ["Byte", "Giga", "Bit", "Méga"],
        answer: "Bit",
        anecdote:
          "La mémoire est un composant matériel essentiel de nombreux appareils électroniques, présent dans tousles ordinateurs.",
      },
      {
        id: 10,
        question:
          "Dans le langage familier, comment appelle-t-on la dent du petit enfant ?",
        propositions: ["Marmotte", "Bouillotte", "Quenotte", "Menotte"],
        answer: "Quenotte",
        anecdote:
          "Il est important de bien se brosser les dents de manière régulière si l'on veut éviter la proliférationde caries dans la bouche.",
      },
      {
        id: 11,
        question:
          "Où se situe la célèbre base navale américaine de Guantanamo, réputée pour sa sévérité ?",
        propositions: ["Mexique", "Cuba", "Paraguay", "Hawaii"],
        answer: "Cuba",
        anecdote:
          "La base de Guantanamo, très hautement sécurisée, détient des personnes et des individus qualifiés decombattants hors-la-loi.",
      },
      {
        id: 12,
        question:
          "Quelle est la spécialité du sportif tunisien Oussama Mellouli ?",
        propositions: ["Football", "Natation", "Marathon", "Boxe"],
        answer: "Natation",
        anecdote:
          "Oussama Mellouli est le premier champion olympique tunisien du milieu de la natation professionnelle àavoir remporté ce titre.",
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
        anecdote:
          "Le film « Le Guépard », mettant en scène l'acteur Alain Delon, décrit la chute de l'aristocratieitalienne, dont la scène du bal donne la clé.",
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
        anecdote:
          "Sans faire partie des Douze, Saint Paul a toutefois marqué le christianisme par son interprétation del'enseignement de Jésus.",
      },
      {
        id: 15,
        question:
          "Quel titre de noblesse est immédiatement inférieur à celui de comte ?",
        propositions: ["Archiduc", "Duc", "Marquis", "Vicomte"],
        answer: "Vicomte",
        anecdote:
          "Vicomte est une distinction héréditaire que beaucoup revendiquent mais à laquelle ne sont attachésaucuns pouvoirs.",
      },
      {
        id: 16,
        question:
          "Quelle est la capitale de la Nouvelle-Zélande, au sud-ouest de l'océan Pacifique ?",
        propositions: ["Auckland", "Wellington", "Dublin", "Sydney"],
        answer: "Wellington",
        anecdote:
          "Troisième ville la plus peuplée du pays, Wellington fait partie des douze meilleures villes danslaquelle vivre.",
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
        anecdote:
          "Dans le film « Diabolique », la femme et la maîtresse d'un professeur s'associent pour planifier sonassassinat.",
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
        anecdote:
          "La Transat Jacques Vabre ou route du café, course transatlantique en double, se déroule tous les deuxans depuis 1993.",
      },
      {
        id: 19,
        question:
          "Quel oiseau vivant dans l'hémisphère nord nage le plus vite ?",
        propositions: ["Pingouin", "Bécassine", "Pie", "Martinet"],
        answer: "Pingouin",
        anecdote:
          "Par abus de langage, le pingouin est souvent confondu avec le manchot, de par sa ressemblance avec leGrand Pingouin.",
      },
      {
        id: 20,
        question:
          "Quelle est la plus grosse des planètes de notre Système solaire ?",
        propositions: ["Neptune", "Saturne", "Jupiter", "Uranus"],
        answer: "Jupiter",
        anecdote:
          "Jupiter est une planète géante gazeuse, la plus grosse planète du Système solaire.",
      },
      {
        id: 21,
        question:
          "Apparu il y a 450 millions d'années, à quelle classe animale le scorpion appartient-il ?",
        propositions: ["Arachnides", "Reptiles", "Mammifères", "Insectes"],
        answer: "Arachnides",
        anecdote:
          "Les scorpions se distinguent des araignées par un aiguillon venimeux situé au bout de leur abdomenpouvant être mortel pour l'homme.",
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
        anecdote:
          "« La fièvre du samedi soir », réalisé par John Badham, fut un des principaux vecteurs de diffusion de lamusique et de la mode disco.",
      },
      {
        id: 23,
        question: "Au Moyen Âge, comment appelait-on un village fortifié ?",
        propositions: ["Tour", "Bastide", "Rempart", "Château fort"],
        answer: "Bastide",
        anecdote:
          "De nos jours, les bastides les plus connues sont celles de Monflanquin, Monpazier, Grenade ou bienencore Libourne.",
      },
      {
        id: 24,
        question:
          "Quelle ville du Kent est célèbre pour sa source miraculeuse ?",
        propositions: ["Dartford", "Tunbridge Wells", "Gillingham", "Ramsgate"],
        answer: "Tunbridge Wells",
        anecdote:
          "Comme la reine Victoria, de nombreuses personnes célèbres sont venues en cure à Tunbridge Wells profiterde sa source miraculeuse.",
      },
      {
        id: 25,
        question:
          "Quel apéritif à base de vin est aromatisé avec des plantes amères et toniques ?",
        propositions: ["Vermouth", "Gentiane", "Kokebok", "Piccolo"],
        answer: "Vermouth",
        anecdote:
          "Dans une classification du plus sec au plus doux, on trouve le vermouth sec, le blanc, le rosé et lerouge.",
      },
      {
        id: 26,
        question:
          "À quel écrivain, membre de l'Académie française, doit-on le roman intitulé « Le sagouin » ?",
        propositions: ["Giono", "Barjavel", "Mauriac", "Camus"],
        answer: "Mauriac",
        anecdote:
          "Dans le roman « Le sagouin », écrit en quatre parties, on peut supposer que l'action se passe vers1920.",
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
        anecdote:
          "Suite à ce décès inopiné, on a souvent dit de Félix Faure qu'il était un président plus célèbre par samort que par sa vie.",
      },
      {
        id: 28,
        question:
          "Comment appelle-t-on le versant de la montagne non situé au soleil ?",
        propositions: ["Ressac", "Étant", "Adret", "Ubac"],
        answer: "Ubac",
        anecdote:
          "Dans l'hémisphère Nord, l'ubac est généralement la face Nord d'une montagne alors que l'adret enreprésente la face Sud.",
      },
      {
        id: 29,
        question:
          "Quel oiseau palmipède a pour particularité de construire un nid flottant ?",
        propositions: ["Grèle", "Grèbe", "Grène", "Grève"],
        answer: "Grèbe",
        anecdote:
          "La position des pattes, très courtes et très en arrière par rapport au corps, a valu au grèbe le jolinom de pieds au derrière.",
      },
      {
        id: 30,
        question:
          "Un bédane, qui doit son nom à sa ressemblance avec un bec de canard, est un outil proche du...",
        propositions: ["Ciseau à bois", "Vilebrequin", "Rabot", "Maillet"],
        answer: "Ciseau à bois",
        anecdote:
          "Le bédane est un outil encore parfois utilisé aujourd'hui pour réaliser des pièces en bois tournéesentre pointes.",
      },
    ];
    if (gameStatuses.get(game._id)) return;
    gameStatuses.set(game._id, true);
    const firstQuestion = await gameService.setCurrentQuestion(
      game._id,
      allQuizzes[0]
    );
    namespace.to(game._id).emit("question", firstQuestion);

    let questionIndex = 1;

    const interval = setInterval(async () => {
      try {
        if (questionIndex < allQuizzes.length) {
          const question = allQuizzes[questionIndex];
          const currentQuestion = await gameService.setCurrentQuestion(
            game._id,
            question
          );
          namespace.to(game._id).emit("question", currentQuestion);
          questionIndex += 1;
          console.log(currentQuestion);
          remainingTimes.set(
            game._id,
            remainingTimes.get(game._id) - game.settings.questionTime
          );
        } else {
          clearInterval(interval);
          console.log("tous les question du quizz sont passé");
          const winner = await Promise.race([
            gameService.getWinner(game._id),
            new Promise((_, reject) =>
              setTimeout(
                () => reject(new Error("Getting winner took too long")),
                game.settings.questionTime * 1000
              )
            ),
          ]);
          namespace.to(game._id).emit("game_over", winner);
        }
        namespace
          .to(game._id)
          .emit("remaining_time", getRemainingTime(game._id));
      } catch (err) {
        console.error(err);
        clearInterval(interval);
      }
    }, game.settings.questionTime * 1000);
    remainingTimes.set(
      game._id,
      game.settings.questionTime * allQuizzes.length
    );
  };

  const handleConnection = async (socket) => {
    const code = socket.handshake.query["code"];
    const { token } = socket.handshake.auth;
    const user = await securityService.getUserFromToken(token);
    const game = await gameService.findOneByCode(code);

    if (!game) return;

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
          console.log("Correct answer! Score incremented.");
        } else {
          await gameService.decrementLives(game._id, user._id);
          const lives = await gameService.getLives(game._id, user._id);
          console.log("Incorrect answer! Remaining lives:", lives);
          if (lives === 0) {
            socket.emit("eliminated");
            socket.leave(game._id);
            await gameService.eliminatePlayer(game._id, user._id);
            namespace.to(game._id).emit("player_eliminated", user.username);
            console.log("Player eliminated.");
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
      if (!game.isStarted) {
        await gameService.startGame(game._id);
        startGame(game);
      } else {
        const currentQuestion = await gameService.getCurrentQuestion(game._id);
        socket.emit("question", currentQuestion);
        socket.emit("remaining_time", getRemainingTime(game._id));
      }
    });

    socket.on("disconnect", async () => {
      socket.leave(game._id);
      const players = await gameService.removePlayer(game._id, user._id);
      namespace.to(game._id).emit("notification", {
        title: "Someone just left",
        description: `${user.username} just left the game`,
      });
      namespace.to(game._id).emit("players", players);
      if (game.isStarted) return;
      if (players.length === 0) {
        gameStatuses.set(game._id, false);
      }
    });
  };

  namespace.on("connection", handleConnection);
};
