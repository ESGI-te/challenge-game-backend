const sinon = require("sinon");
const chai = require("chai");
const expect = chai.expect;
const mongoose = require("mongoose");
const historyService = require("../../services/history.service.js")();
const History = require("../../models/history.model");
const ValidationError = require("../../errors/ValidationError");

let HistoryMock;

describe("historyService", function () {
  beforeEach(function () {
    HistoryMock = sinon.mock(History);
  });

  afterEach(function () {
    HistoryMock.restore();
  });

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
      // More histories can be added here
    ];

    const queryStub = {
      limit: sinon.stub().returnsThis(),
      skip: sinon.stub().returnsThis(),
      sort: sinon.stub().returnsThis(),
      exec: sinon.stub().resolves(data),
    };

    HistoryMock.expects("find").withArgs({}).returns(queryStub);

    const result = await historyService.findAll(
      {},
      { page: 1, itemsPerPage: 10, order: { createdAt: -1 } }
    );
    expect(result).to.eql(data);
    HistoryMock.verify();
  });

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

    HistoryMock.expects("findById").withArgs(sinon.match.string).resolves(data);

    const result = await historyService.findOne("1234");
    expect(result).to.eql(data);
    HistoryMock.verify();
  });

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

    HistoryMock.expects("findOne")
      .withArgs({ userId: sinon.match.string })
      .resolves(data);

    const result = await historyService.findOneByUser("1234");
    expect(result).to.eql(data);
    HistoryMock.verify();
  });
});
