const sinon = require("sinon");
const { expect } = require("chai");
const GameInvitation = require("../../models/gameInvitation.model.js");
const gameInvitationService =
  require("../../services/gameInvitation.service")();
const mongoose = require("mongoose");

describe("GameInvitation service", function () {
  let GameInvitationMock;

  beforeEach(function () {
    GameInvitationMock = sinon.mock(GameInvitation);
  });

  afterEach(function () {
    GameInvitationMock.restore();
  });

  it("should create a new game invitation", async function () {
    const data = {
      gameId: "abc123",
      inviterId: "def456",
      inviteeId: "ghi789",
    };

    GameInvitationMock.expects("create").withArgs(data).resolves(data);

    const result = await gameInvitationService.create(data);
    expect(result).to.eql(data);
    GameInvitationMock.verify();
  });

  it("should find a game invitation by id", async function () {
    const data = {
      _id: "1234",
      gameId: "abc123",
      inviterId: "def456",
      inviteeId: "ghi789",
    };

    GameInvitationMock.expects("findById")
      .withArgs(sinon.match.string)
      .resolves(data);

    const result = await gameInvitationService.findOneById("1234");
    expect(result).to.eql(data);
    GameInvitationMock.verify();
  });

  it("should update a game invitation", async function () {
    const data = {
      gameId: "abc123",
      inviterId: "def456",
      inviteeId: "ghi789",
    };
    const newData = {
      gameId: "jkl012",
    };

    GameInvitationMock.expects("findByIdAndUpdate")
      .withArgs("1234", newData, { new: true })
      .resolves({ ...data, ...newData });

    const result = await gameInvitationService.updateOne("1234", newData);
    expect(result).to.include({ ...data, ...newData });
    GameInvitationMock.verify();
  });

  it("should delete a game invitation", async function () {
    GameInvitationMock.expects("findByIdAndDelete")
      .withArgs(sinon.match.string)
      .resolves({});

    const result = await gameInvitationService.deleteOne("1234");
    expect(result).to.be.true;
    GameInvitationMock.verify();
  });
});
