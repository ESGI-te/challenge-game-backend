// Importation des dépendances
const chai = require("chai"); // Bibliothèque Chai pour les assertions
const sinon = require("sinon"); // Bibliothèque Sinon.js pour les faux (spies, stubs, mocks)
const expect = chai.expect; // Méthode d'assertion "expect"

const lobbyService = require("../../services/lobby.service")(); // Service de gestion du lobby
const Lobby = require("../../models/lobby.model"); // Modèle Lobby (lobby de jeu)
const ValidationError = require("../../errors/ValidationError"); // Classe d'erreur pour la validation

// Description des tests pour le service lobbyService
describe("LobbyService", function () {
  // Description du test : trouver un lobby par son identifiant
  describe("findOne", function () {
    it("should find a lobby by ID", async function () {
      const lobbyId = "60df60068a04914fb4c4c3b5";
      const data = {
        _id: lobbyId,
        invitation_code: "ABC123",
        players: ["player1", "player2"],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const LobbyMock = sinon.mock(Lobby);
      LobbyMock.expects("findById").withArgs(lobbyId).resolves(data);

      const result = await lobbyService.findOne(lobbyId);

      expect(result).to.deep.eql(data);

      LobbyMock.verify();
    });
  });

  // Description du test : trouver un lobby par le code d'invitation
  describe("findOneByCode", function () {
    it("should find a lobby by invitation code", async function () {
      const invitationCode = "ABC123";
      const data = {
        _id: "60df60068a04914fb4c4c3b5",
        invitation_code: invitationCode,
        players: ["player1", "player2"],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const LobbyMock = sinon.mock(Lobby);
      LobbyMock.expects("findOne")
        .withArgs({ invitation_code: invitationCode })
        .resolves(data);
      const result = await lobbyService.findOneByCode(invitationCode);
      expect(result).to.deep.eql(data);
      LobbyMock.verify();
    });
  });

  // Description du test : mettre à jour un lobby
  describe("updateOne", function () {
    it("should throw ValidationError when invalid data is provided", async function () {
      const lobbyId = "60df60068a04914fb4c4c3b5";
      const data = {
        _id: lobbyId,
        invitation_code: "ABC123",
        players: ["player1", "player2"],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Définir newData ici
      const newData = {
        invitation_code: "XYZ456",
        players: ["player3", "player4"],
      };

      const LobbyMock = sinon.mock(Lobby);
      LobbyMock.expects("findByIdAndUpdate")
        .withArgs(lobbyId, newData, { new: true })
        .rejects(new ValidationError());

      try {
        await lobbyService.updateOne(lobbyId, newData);
      } catch (error) {
        expect(error).to.be.an.instanceOf(ValidationError);
      }

      LobbyMock.verify();
    });
  });

  // Description du test : supprimer un lobby
  describe("deleteOne", function () {
    it("should delete a lobby by ID", async function () {
      const lobbyId = "60df60068a04914fb4c4c3b5";
      const LobbyMock = sinon.mock(Lobby);
      LobbyMock.expects("findByIdAndDelete").withArgs(lobbyId).resolves(true);
      const result = await lobbyService.deleteOne(lobbyId);
      expect(result).to.be.true;
      LobbyMock.verify();
    });
  });

  // Description du test : obtenir les joueurs dans un lobby par son identifiant
  describe("getPlayers", function () {
    it("should get players in a lobby by lobby ID", async function () {
      // Données de test
      const lobbyId = "60df60068a04914fb4c4c3b5";
      const lobbyData = {
        _id: lobbyId,
        invitation_code: "ABC123",
        players: ["player1", "player2"],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const LobbyMock = sinon.mock(Lobby);
      LobbyMock.expects("findOne")
        .withArgs({ _id: lobbyId }, "players")
        .resolves(lobbyData);
      const result = await lobbyService.getPlayers(lobbyId);
      expect(result).to.deep.eql(lobbyData.players);
      LobbyMock.verify();
    });
  });

  // Description du test : ajouter un joueur à un lobby
  describe("addPlayer", function () {
    it("should add a player to a lobby", async function () {
      const lobbyId = "60df60068a04914fb4c4c3b5";
      const player = {
        _id: "player123",
        username: "newplayer",
      };
      const updatedPlayers = [
        {
          id: player._id,
          username: player.username,
        },
        {
          id: "oldplayer123",
          username: "oldplayer",
        },
      ];

      const LobbyMock = sinon.mock(Lobby);
      LobbyMock.expects("findOneAndUpdate")
        .withArgs(
          { _id: lobbyId, "players.id": { $ne: player._id } },
          {
            $addToSet: {
              players: { id: player._id, username: player.username },
            },
          },
          { new: true }
        )
        .resolves({ _id: lobbyId, players: updatedPlayers });

      const result = await lobbyService.addPlayer(lobbyId, player);

      expect(result).to.deep.eql(updatedPlayers);

      LobbyMock.verify();
    });
  });

  // Description du test : supprimer un joueur d'un lobby
  describe("removePlayer", function () {
    it("should remove a player from a lobby", async function () {
      const lobbyId = "60df60068a04914fb4c4c3b5";
      const playerId = "player123";
      const updatedPlayers = [
        {
          id: "oldplayer123",
          username: "oldplayer",
        },
      ];

      const LobbyMock = sinon.mock(Lobby);
      LobbyMock.expects("findOneAndUpdate")
        .withArgs(
          { _id: lobbyId },
          { $pull: { players: { id: playerId } } },
          { new: true }
        )
        .resolves({ _id: lobbyId, players: updatedPlayers });
      const result = await lobbyService.removePlayer(lobbyId, playerId);
      expect(result).to.deep.eql(updatedPlayers);
      LobbyMock.verify();
    });
  });

  // Description du test : voter pour un thème dans un lobby
  describe("voteTheme", function () {
    it("should vote for a theme in a lobby", async function () {
      const lobbyId = "60df60068a04914fb4c4c3b5";
      const themeId = "theme123";
      const userId = "user123";
      const lobbyData = {
        _id: lobbyId,
        themes: [
          {
            id: themeId,
            voters: [],
          },
        ],
      };
      const LobbyMock = sinon.mock(Lobby);
      LobbyMock.expects("findOneAndUpdate")
        .withArgs(
          {
            _id: lobbyId,
            "themes.id": themeId,
            "themes.voters": { $ne: userId },
          },
          { $addToSet: { "themes.$.voters": userId } },
          { new: true }
        )
        .resolves(lobbyData);

      const result = await lobbyService.voteTheme({ lobbyId, themeId, userId });

      expect(result).to.deep.eql(lobbyData.themes);

      LobbyMock.verify();
    });
  });

  // Description du test : définir le thème voté pour un lobby
  describe("setVotedTheme", function () {
    it("should set the voted theme for a lobby", async function () {
      const lobbyId = "60df60068a04914fb4c4c3b5";
      const themeId = "theme123";
      const lobbyData = {
        _id: lobbyId,
        votedTheme: null,
      };

      const LobbyMock = sinon.mock(Lobby);
      LobbyMock.expects("findOneAndUpdate")
        .withArgs(
          { _id: lobbyId },
          { $set: { votedTheme: themeId } },
          { new: true }
        )
        .resolves({ ...lobbyData, votedTheme: themeId });
      const result = await lobbyService.setVotedTheme(lobbyId, themeId);
      expect(result).to.deep.eql(themeId);
      LobbyMock.verify();
    });
  });
});
