const sinon = require("sinon");
const mongoose = require("mongoose");
const GameService = require("../../services/game.service.js");
const Game = require("../../models/game.model");

describe("Game Service", () => {
  beforeAll(() => {
    this.gameService = GameService();
  });

  afterEach(() => {
    sinon.restore();
  });

  test("findAll() should return all games", async () => {
    const games = [
      {
        name: "Game 1",
      },
      {
        name: "Game 2",
      },
    ];

    const findStub = sinon.stub(Game, "find").returns({
      limit: sinon.stub().returnsThis(),
      skip: sinon.stub().returnsThis(),
      sort: sinon.stub().returns(games),
    });

    const result = await this.gameService.findAll(
      {},
      { page: 1, itemsPerPage: 10, order: {} }
    );

    expect(findStub.calledOnce).toBeTruthy();
    expect(result).toEqual(games);
  });

  test("create() should create a new game", async () => {
    const gameData = { name: "Game 1" };
    const createStub = sinon.stub(Game, "create").resolves(gameData);

    const result = await this.gameService.create(gameData);

    expect(createStub.calledOnce).toBeTruthy();
    expect(result).toEqual(gameData);
  });

  test("findOne() should return a game by id", async () => {
    const gameData = { _id: "60d0fe4f5311236168a109ca", name: "Game 1" };
    const findByIdStub = sinon.stub(Game, "findById").resolves(gameData);

    const result = await this.gameService.findOne(gameData._id);

    expect(findByIdStub.calledOnce).toBeTruthy();
    expect(result).toEqual(gameData);
  });

  test("updateOne() should update a game by id", async () => {
    const gameData = { _id: "60d0fe4f5311236168a109ca", name: "Game 1" };
    const updatedGameData = { _id: "60d0fe4f5311236168a109ca", name: "Game 2" };
    const findByIdAndUpdateStub = sinon
      .stub(Game, "findByIdAndUpdate")
      .resolves(updatedGameData);

    const result = await this.gameService.updateOne(gameData._id, {
      name: "Game 2",
    });

    expect(findByIdAndUpdateStub.calledOnce).toBeTruthy();
    expect(result).toEqual(updatedGameData);
  });

  test("deleteOne() should delete a game by id", async () => {
    const gameData = { _id: "60d0fe4f5311236168a109ca", name: "Game 1" };
    const findByIdAndDeleteStub = sinon
      .stub(Game, "findByIdAndDelete")
      .resolves(gameData);

    const result = await this.gameService.deleteOne(gameData._id);

    expect(findByIdAndDeleteStub.calledOnce).toBeTruthy();
    expect(result).toBeTruthy();
  });

  test("addPlayer() should add a player to a game", async () => {
    const gameId = "60d0fe4f5311236168a109ca";
    const player = {
      _id: "60d0fe4f5311236168a109cb",
      username: "player1",
      score: 0,
      lives: 3,
    };
    const findOneAndUpdateStub = sinon.stub(Game, "findOneAndUpdate").resolves({
      players: [player],
    });

    const result = await this.gameService.addPlayer(gameId, player);

    expect(findOneAndUpdateStub.calledOnce).toBeTruthy();
    expect(result).toEqual([player]);
  });
  test("findOneByCode() should find a game by code", async () => {
    const gameData = { _id: "60d0fe4f5311236168a109ca", code: "abc123" };
    const findOneStub = sinon.stub(Game, "findOne").resolves(gameData);

    const result = await this.gameService.findOneByCode(gameData.code);

    expect(findOneStub.calledOnce).toBeTruthy();
    expect(result).toEqual(gameData);
  });

  test("removePlayer() should remove a player from a game", async () => {
    const gameId = "60d0fe4f5311236168a109ca";
    const playerId = "60d0fe4f5311236168a109cb";
    const players = [{ id: playerId, username: "player1", score: 0, lives: 3 }];
    const findOneAndUpdateStub = sinon.stub(Game, "findOneAndUpdate").resolves({
      players: [],
    });

    const result = await this.gameService.removePlayer(gameId, playerId);

    expect(findOneAndUpdateStub.calledOnce).toBeTruthy();
    expect(result).toEqual([]);
  });

  test("updateCurrentQuestion() should update the current question of a game", async () => {
    const gameId = "60d0fe4f5311236168a109ca";
    const question = {
      id: "60d0fe4f5311236168a109cc",
      text: "Question 1",
      answer: "Answer 1",
    };
    const findByIdStub = sinon.stub(Game, "findById").resolves({
      _id: gameId,
      currentQuestion: null,
      save: sinon.stub().resolvesThis(),
    });

    const result = await this.gameService.updateCurrentQuestion(
      gameId,
      question
    );

    expect(findByIdStub.calledOnce).toBeTruthy();
    expect(result.currentQuestion).toEqual(question);
  });
});
