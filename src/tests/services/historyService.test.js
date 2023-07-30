// Importation des dépendances
const sinon = require("sinon"); // Bibliothèque Sinon.js pour les faux (spies, stubs, mocks)
const chai = require("chai"); // Bibliothèque Chai pour les assertions
const expect = chai.expect; // Méthode d'assertion "expect"
const mongoose = require("mongoose"); // Bibliothèque de gestion de base de données MongoDB
const historyService = require("../../services/history.service.js")(); // Service de gestion de l'historique des parties
const History = require("../../models/history.model"); // Modèle History (historique des parties)
const ValidationError = require("../../errors/ValidationError"); // Classe d'erreur pour la validation

let HistoryMock;

// Description des tests pour le service historyService
describe("historyService", function () {
  beforeEach(function () {
    HistoryMock = sinon.mock(History); // Créer un faux pour le modèle History avant chaque test
  });

  // Après chaque test
  afterEach(function () {
    HistoryMock.restore(); // Restaurer le modèle History original
  });

  // Test : retourner une liste d'entrées d'historique
  it("should return a list of history entries", async function () {
    const data = [
      {
        _id: new mongoose.Types.ObjectId(),
        userId: new mongoose.Types.ObjectId(),
        games: [
          {
            gameStatsId: "123",
            score: 1000,
            rank: 1,
            lives: 2,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // D'autres entrées d'historique peuvent être ajoutées ici
    ];

    // Crée un faux pour la méthode "find" du modèle History qui renvoie les données spécifiées
    const queryStub = {
      limit: sinon.stub().returnsThis(),
      skip: sinon.stub().returnsThis(),
      sort: sinon.stub().returnsThis(),
      exec: sinon.stub().resolves(data),
    };

    // Attend que la méthode "find" du modèle History soit appelée avec les arguments spécifiés et renvoie les données
    HistoryMock.expects("find").withArgs({}).returns(queryStub);

    // Appel de la méthode "findAll" du service historyService avec les paramètres spécifiés
    const result = await historyService.findAll(
      {},
      { page: 1, itemsPerPage: 10, order: { createdAt: -1 } }
    );

    // Vérifie que la méthode "find" du modèle History a été appelée comme prévu
    expect(result).to.eql(data);
    HistoryMock.verify();
  });

  // Test : trouver un historique par son identifiant
  it("should return a history by id", async function () {
    const data = {
      _id: new mongoose.Types.ObjectId(),
      userId: new mongoose.Types.ObjectId(),
      games: [
        {
          gameStatsId: "123",
          score: 1000,
          rank: 1,
          lives: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Attend que la méthode "findById" du modèle History soit appelée avec n'importe quelle chaîne en argument et renvoie les données spécifiées
    HistoryMock.expects("findById").withArgs(sinon.match.string).resolves(data);

    // Appel de la méthode "findOne" du service historyService avec l'identifiant "1234"
    const result = await historyService.findOne("1234");

    // Vérifie que la méthode "findById" du modèle History a été appelée comme prévu
    expect(result).to.eql(data);
    HistoryMock.verify();
  });

  // Test : trouver un historique par l'identifiant de l'utilisateur
  it("should return a history by user id", async function () {
    const data = {
      _id: new mongoose.Types.ObjectId(),
      userId: new mongoose.Types.ObjectId(),
      games: [
        {
          gameStatsId: "123",
          score: 1000,
          rank: 1,
          lives: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Attend que la méthode "findOne" du modèle History soit appelée avec un objet contenant l'identifiant de l'utilisateur en argument et renvoie les données spécifiées
    HistoryMock.expects("findOne").withArgs({ userId: sinon.match.string }).resolves(data);

    // Appel de la méthode "findOneByUser" du service historyService avec l'identifiant "1234"
    const result = await historyService.findOneByUser("1234");

    // Vérifie que la méthode "findOne" du modèle History a été appelée comme prévu
    expect(result).to.eql(data);
    HistoryMock.verify();
  });
});
