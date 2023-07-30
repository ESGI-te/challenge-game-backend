// Importation des dépendances
const sinon = require("sinon"); // Bibliothèque Sinon.js pour les faux (spies, stubs, mocks)
const mongoose = require("mongoose"); // Bibliothèque de gestion de base de données MongoDB
const GameService = require("../../services/game.service.js"); // Service de gestion des jeux
const Game = require("../../models/game.model"); // Modèle Game

// Description des tests pour le service Game
describe("Game Service", () => {
  beforeAll(() => {
    this.gameService = GameService(); // Initialisation du service GameService
  });

  // Après chaque test
  afterEach(() => {
    sinon.restore(); // Restaurer les faux créés par Sinon.js
  });

  // Test : trouver tous les jeux
  test("findAll() should return all games", async () => {
    const games = [
      {
        name: "Game 1",
      },
      {
        name: "Game 2",
      },
    ];

    // Crée un faux pour la méthode "find" du modèle Game qui renvoie les jeux spécifiés
    const findStub = sinon.stub(Game, "find").returns({
      limit: sinon.stub().returnsThis(),
      skip: sinon.stub().returnsThis(),
      sort: sinon.stub().returns(games),
    });

    // Appel de la méthode "findAll" du service gameService avec les paramètres spécifiés
    const result = await this.gameService.findAll({}, { page: 1, itemsPerPage: 10, order: {} });

    // Vérifie que la méthode "find" du modèle Game a été appelée comme prévu
    expect(findStub.calledOnce).toBeTruthy();

    // Vérifie que le résultat est égal aux jeux spécifiés
    expect(result).toEqual(games);
  });

  // Test : créer un nouveau jeu
  test("create() should create a new game", async () => {
    const gameData = { name: "Game 1" };

    // Crée un faux pour la méthode "create" du modèle Game qui renvoie les données du jeu créé
    const createStub = sinon.stub(Game, "create").resolves(gameData);

    // Appel de la méthode "create" du service gameService avec les données du jeu
    const result = await this.gameService.create(gameData);

    // Vérifie que la méthode "create" du modèle Game a été appelée comme prévu
    expect(createStub.calledOnce).toBeTruthy();

    // Vérifie que le résultat est égal aux données du jeu créé
    expect(result).toEqual(gameData);
  });

  // Test : trouver un jeu par son identifiant
  test("findOne() should return a game by id", async () => {
    const gameData = { _id: "60d0fe4f5311236168a109ca", name: "Game 1" };

    // Crée un faux pour la méthode "findById" du modèle Game qui renvoie le jeu spécifié
    const findByIdStub = sinon.stub(Game, "findById").resolves(gameData);

    // Appel de la méthode "findOne" du service gameService avec l'identifiant du jeu
    const result = await this.gameService.findOne(gameData._id);

    // Vérifie que la méthode "findById" du modèle Game a été appelée comme prévu
    expect(findByIdStub.calledOnce).toBeTruthy();

    // Vérifie que le résultat est égal au jeu spécifié
    expect(result).toEqual(gameData);
  });

  // Test : mettre à jour un jeu par son identifiant
  test("updateOne() should update a game by id", async () => {
    const gameData = { _id: "60d0fe4f5311236168a109ca", name: "Game 1" };
    const updatedGameData = { _id: "60d0fe4f5311236168a109ca", name: "Game 2" };

    // Crée un faux pour la méthode "findByIdAndUpdate" du modèle Game qui renvoie les données du jeu mises à jour
    const findByIdAndUpdateStub = sinon.stub(Game, "findByIdAndUpdate").resolves(updatedGameData);

    // Appel de la méthode "updateOne" du service gameService avec l'identifiant du jeu et les nouvelles données
    const result = await this.gameService.updateOne(gameData._id, {
      name: "Game 2",
    });

    // Vérifie que la méthode "findByIdAndUpdate" du modèle Game a été appelée comme prévu
    expect(findByIdAndUpdateStub.calledOnce).toBeTruthy();

    // Vérifie que le résultat est égal aux données du jeu mises à jour
    expect(result).toEqual(updatedGameData);
  });

  // Test : supprimer un jeu par son identifiant
  test("deleteOne() should delete a game by id", async () => {
    const gameData = { _id: "60d0fe4f5311236168a109ca", name: "Game 1" };

    // Crée un faux pour la méthode "findByIdAndDelete" du modèle Game qui renvoie les données du jeu supprimé
    const findByIdAndDeleteStub = sinon.stub(Game, "findByIdAndDelete").resolves(gameData);

    // Appel de la méthode "deleteOne" du service gameService avec l'identifiant du jeu
    const result = await this.gameService.deleteOne(gameData._id);

    // Vérifie que la méthode "findByIdAndDelete" du modèle Game a été appelée comme prévu
    expect(findByIdAndDeleteStub.calledOnce).toBeTruthy();

    // Vérifie que le résultat est vrai (true indique que la suppression a réussi)
    expect(result).toBeTruthy();
  });

  // Test : ajouter un joueur à un jeu
  test("addPlayer() should add a player to a game", async () => {
    const gameId = "60d0fe4f5311236168a109ca";
    const player = {
      _id: "60d0fe4f5311236168a109cb",
      username: "player1",
      score: 0,
      lives: 3,
    };

    // Crée un faux pour la méthode "findOneAndUpdate" du modèle Game qui renvoie les données du jeu avec le joueur ajouté
    const findOneAndUpdateStub = sinon.stub(Game, "findOneAndUpdate").resolves({
      players: [player],
    });

    // Appel de la méthode "addPlayer" du service gameService avec l'identifiant du jeu et les données du joueur
    const result = await this.gameService.addPlayer(gameId, player);

    // Vérifie que la méthode "findOneAndUpdate" du modèle Game a été appelée comme prévu
    expect(findOneAndUpdateStub.calledOnce).toBeTruthy();

    // Vérifie que le résultat est égal aux données du jeu avec le joueur ajouté
    expect(result).toEqual([player]);
  });

  // Test : trouver un jeu par son code
  test("findOneByCode() should find a game by code", async () => {
    const gameData = { _id: "60d0fe4f5311236168a109ca", code: "abc123" };

    // Crée un faux pour la méthode "findOne" du modèle Game qui renvoie le jeu spécifié
    const findOneStub = sinon.stub(Game, "findOne").resolves(gameData);

    // Appel de la méthode "findOneByCode" du service gameService avec le code du jeu
    const result = await this.gameService.findOneByCode(gameData.code);

    // Vérifie que la méthode "findOne" du modèle Game a été appelée comme prévu
    expect(findOneStub.calledOnce).toBeTruthy();

    // Vérifie que le résultat est égal au jeu spécifié
    expect(result).toEqual(gameData);
  });

  // Test : supprimer un joueur d'un jeu
  test("removePlayer() should remove a player from a game", async () => {
    const gameId = "60d0fe4f5311236168a109ca";
    const playerId = "60d0fe4f5311236168a109cb";
    const players = [{ id: playerId, username: "player1", score: 0, lives: 3 }];

    // Crée un faux pour la méthode "findOneAndUpdate" du modèle Game qui renvoie les données du jeu avec le joueur supprimé
    const findOneAndUpdateStub = sinon.stub(Game, "findOneAndUpdate").resolves({
      players: [],
    });

    // Appel de la méthode "removePlayer" du service gameService avec l'identifiant du jeu et l'identifiant du joueur
    const result = await this.gameService.removePlayer(gameId, playerId);

    // Vérifie que la méthode "findOneAndUpdate" du modèle Game a été appelée comme prévu
    expect(findOneAndUpdateStub.calledOnce).toBeTruthy();

    // Vérifie que le résultat est égal à un tableau vide (indiquant que le joueur a été supprimé)
    expect(result).toEqual([]);
  });

  // Test : mettre à jour la question actuelle d'un jeu
  test("updateCurrentQuestion() should update the current question of a game", async () => {
    const gameId = "60d0fe4f5311236168a109ca";
    const question = {
      id: "60d0fe4f5311236168a109cc",
      text: "Question 1",
      answer: "Answer 1",
    };

    // Crée un faux pour la méthode "findById" du modèle Game qui renvoie le jeu spécifié avec la question actuelle mise à jour
    const findByIdStub = sinon.stub(Game, "findById").resolves({
      _id: gameId,
      currentQuestion: null,
      save: sinon.stub().resolvesThis(),
    });

    // Appel de la méthode "updateCurrentQuestion" du service gameService avec l'identifiant du jeu et les données de la nouvelle question
    const result = await this.gameService.updateCurrentQuestion(gameId, question);

    // Vérifie que la méthode "findById" du modèle Game a été appelée comme prévu
    expect(findByIdStub.calledOnce).toBeTruthy();

    // Vérifie que la question actuelle du jeu a été mise à jour correctement
    expect(result.currentQuestion).toEqual(question);
  });
});
