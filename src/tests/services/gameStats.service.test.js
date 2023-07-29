const sinon = require("sinon");
const chai = require("chai");
const expect = chai.expect;
const mongoose = require("mongoose");
const gameStatsService = require("../../services/gameStats.service.js")();
const Stats = require("../../models/gameStats.model");
const ValidationError = require("../../errors/ValidationError");

let StatsMock;

describe("gameStatsService", function () {
  beforeEach(function () {
    StatsMock = sinon.mock(Stats);
  });

  afterEach(function () {
    StatsMock.restore();
  });

  it("should return a list of game stats", async function () {
    const data = [
      {
        _id: new mongoose.Types.ObjectId(),
        stats: [
          {
            user: {
              id: new mongoose.Types.ObjectId(),
              username: "testuser1",
            },
            rank: 1,
            score: 5000,
            lives: 3,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            user: {
              id: new mongoose.Types.ObjectId(),
              username: "testuser2",
            },
            rank: 2,
            score: 4500,
            lives: 2,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const queryStub = {
      limit: sinon.stub().returnsThis(),
      skip: sinon.stub().returnsThis(),
      sort: sinon.stub().returnsThis(),
      exec: sinon.stub().resolves(data),
    };

    StatsMock.expects("find").withArgs({}).returns(queryStub);

    const result = await gameStatsService.findAll({}, {});
    expect(result).to.eql(data);
    StatsMock.verify();
  });

  it("should create a new game stat", async function () {
    const data = {
      stats: [
        {
          user: {
            id: new mongoose.Types.ObjectId(),
            username: "test",
          },
          rank: 1,
          score: 100,
          lives: 3,
        },
      ],
    };

    StatsMock.expects("create").withArgs(data).resolves(data);

    const result = await gameStatsService.create(data);
    expect(result).to.eql(data);
    StatsMock.verify();
  });

  it("should return a game stat by id", async function () {
    const data = {
      _id: new mongoose.Types.ObjectId(),
      stats: [
        {
          user: {
            id: new mongoose.Types.ObjectId(),
            username: "test",
          },
          rank: 1,
          score: 100,
          lives: 3,
        },
      ],
    };

    StatsMock.expects("findById").withArgs(sinon.match.string).resolves(data);

    const result = await gameStatsService.findOneById("1234");
    expect(result).to.eql(data);
    StatsMock.verify();
  });

  it("should update a game stat", async function () {
    const data = {
      _id: new mongoose.Types.ObjectId(),
      stats: [
        {
          user: {
            id: new mongoose.Types.ObjectId(),
            username: "test",
          },
          rank: 1,
          score: 100,
          lives: 3,
        },
      ],
    };
    const newData = {
      stats: [
        {
          user: {
            id: new mongoose.Types.ObjectId(),
            username: "test updated",
          },
          rank: 2,
          score: 200,
          lives: 2,
        },
      ],
    };

    StatsMock.expects("findByIdAndUpdate")
      .withArgs(sinon.match.string, newData, { new: true })
      .resolves({ ...data, ...newData });

    const result = await gameStatsService.updateOne("1234", newData);
    expect(result).to.eql({ ...data, ...newData });
    StatsMock.verify();
  });

  it("should delete a game stat", async function () {
    StatsMock.expects("findByIdAndDelete")
      .withArgs(sinon.match.string)
      .resolves(true);

    const result = await gameStatsService.deleteOne("1234");
    expect(result).to.be.true;
    StatsMock.verify();
  });
});
