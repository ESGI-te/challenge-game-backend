// Importation des dépendances
const sinon = require("sinon"); // Bibliothèque Sinon.js pour les faux (spies, stubs, mocks)
const { expect } = require("chai"); // Bibliothèque Chai pour les assertions
const GameInvitation = require("../../models/gameInvitation.model.js"); // Modèle GameInvitation
const gameInvitationService = require("../../services/gameInvitation.service")(); // Service de gestion des invitations de jeu
const mongoose = require("mongoose"); // Bibliothèque de gestion de base de données MongoDB

// Description des tests pour le service GameInvitation
describe("GameInvitation service", function () {
  let GameInvitationMock; // Faux pour le modèle GameInvitation

  // Avant chaque test
  beforeEach(function () {
    GameInvitationMock = sinon.mock(GameInvitation); // Créer un faux pour le modèle GameInvitation
  });

  // Après chaque test
  afterEach(function () {
    GameInvitationMock.restore(); // Restaurer le modèle GameInvitation original
  });

  // Test : créer une nouvelle invitation de jeu
  it("should create a new game invitation", async function () {
    const data = {
      gameId: "abc123",
      inviterId: "def456",
      inviteeId: "ghi789",
    };

    // Attend que la méthode "create" du modèle GameInvitation soit appelée avec les données spécifiées et renvoie les données
    GameInvitationMock.expects("create").withArgs(data).resolves(data);

    // Appel de la méthode "create" du service gameInvitationService avec les données
    const result = await gameInvitationService.create(data);

    // Vérifie que le résultat est égal aux données spécifiées
    expect(result).to.eql(data);

    // Vérifie que la méthode "create" du modèle GameInvitation a été appelée comme prévu
    GameInvitationMock.verify();
  });

  // Test : trouver une invitation de jeu par son identifiant
  it("should find a game invitation by id", async function () {
    const data = {
      _id: "1234",
      gameId: "abc123",
      inviterId: "def456",
      inviteeId: "ghi789",
    };

    // Attend que la méthode "findById" du modèle GameInvitation soit appelée avec n'importe quelle chaîne en argument et renvoie les données spécifiées
    GameInvitationMock.expects("findById")
      .withArgs(sinon.match.string)
      .resolves(data);

    // Appel de la méthode "findOneById" du service gameInvitationService avec l'identifiant "1234"
    const result = await gameInvitationService.findOneById("1234");

    // Vérifie que le résultat est égal aux données spécifiées
    expect(result).to.eql(data);

    // Vérifie que la méthode "findById" du modèle GameInvitation a été appelée comme prévu
    GameInvitationMock.verify();
  });

  // Test : mettre à jour une invitation de jeu
  it("should update a game invitation", async function () {
    const data = {
      gameId: "abc123",
      inviterId: "def456",
      inviteeId: "ghi789",
    };
    const newData = {
      gameId: "jkl012",
    };

    // Attend que la méthode "findByIdAndUpdate" du modèle GameInvitation soit appelée avec l'identifiant "1234", les nouvelles données spécifiées et les options { new: true }, et renvoie les données mises à jour
    GameInvitationMock.expects("findByIdAndUpdate")
      .withArgs("1234", newData, { new: true })
      .resolves({ ...data, ...newData });

    // Appel de la méthode "updateOne" du service gameInvitationService avec l'identifiant "1234" et les nouvelles données spécifiées
    const result = await gameInvitationService.updateOne("1234", newData);

    // Vérifie que le résultat contient les anciennes données combinées avec les nouvelles données spécifiées
    expect(result).to.include({ ...data, ...newData });

    // Vérifie que la méthode "findByIdAndUpdate" du modèle GameInvitation a été appelée comme prévu
    GameInvitationMock.verify();
  });

  // Test : supprimer une invitation de jeu
  it("should delete a game invitation", async function () {
    // Attend que la méthode "findByIdAndDelete" du modèle GameInvitation soit appelée avec n'importe quelle chaîne en argument et renvoie un objet vide
    GameInvitationMock.expects("findByIdAndDelete")
      .withArgs(sinon.match.string)
      .resolves({});

    // Appel de la méthode "deleteOne" du service gameInvitationService avec l'identifiant "1234"
    const result = await gameInvitationService.deleteOne("1234");

    // Vérifie que le résultat est égal à true (true étant utilisé ici pour indiquer que la suppression a réussi)
    expect(result).to.be.true;

    // Vérifie que la méthode "findByIdAndDelete" du modèle GameInvitation a été appelée comme prévu
    GameInvitationMock.verify();
  });
});
