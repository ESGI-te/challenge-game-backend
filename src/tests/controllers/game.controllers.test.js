const request = require("supertest");
const express = require("express");
const gameController = require("../../controllers/game.controller");
const gameService = require("../../services/game.service");

const app = express();
app.use(express.json());
const router = express.Router();
const controller = gameController(gameService);
router.get("/", controller.getAll);
router.post("/", controller.create);
router.get("/:code", controller.getOneByCode);
router.get("/:id", controller.getOne);
router.put("/:id", controller.update);
router.delete("/:id", controller.delete);
app.use("/games", router);

describe("GET /games", () => {
  it("should respond with a json array of games", async () => {
    const games = [
      { id: 1, name: "Game1" },
      { id: 2, name: "Game2" },
    ];
    gameService.findAll = jest.fn().mockResolvedValue(games);

    const res = await request(app).get("/games");

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(games);
  });
});

describe("POST /games", () => {
  it("should respond with the created game", async () => {
    const game = { id: 1, name: "Game1" };
    gameService.create = jest.fn().mockResolvedValue(game);

    const res = await request(app).post("/games").send(game);

    expect(res.statusCode).toEqual(201);
    expect(res.body).toEqual(game);
  });
  describe("GET /games/:code", () => {
    it("should respond with a single game", async () => {
      const game = { id: 1, name: "Game1", code: "CODE1" };
      gameService.findOneByCode = jest.fn().mockResolvedValue(game);

      const res = await request(app).get(`/games/${game.code}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(game);
    });

    it("should respond with 404 when no game is found", async () => {
      gameService.findOneByCode = jest.fn().mockResolvedValue(null);

      const res = await request(app).get("/games/UNKNOWN");

      expect(res.statusCode).toEqual(404);
    });
  });

  describe("DELETE /games/:id", () => {
    it("should delete the game and respond with 204", async () => {
      gameService.deleteOne = jest.fn().mockResolvedValue(true);

      const res = await request(app).delete("/games/1");

      expect(res.statusCode).toEqual(204);
    });

    it("should respond with 404 when no game is found", async () => {
      gameService.deleteOne = jest.fn().mockResolvedValue(false);

      const res = await request(app).delete("/games/9999");

      expect(res.statusCode).toEqual(404);
    });
  });
});
