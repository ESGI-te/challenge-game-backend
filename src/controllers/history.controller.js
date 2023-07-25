const GameStatsService = require("../services/gameStats.service");
const SecurityService = require("../services/security.service");

module.exports = (Service, options = {}) => {
  const securityService = SecurityService();
  const gameStatsService = GameStatsService();

  return {
    async getAll(req, res) {
      const token = req.headers["authorization"]?.split(" ")[1];
      const user = await securityService.getUserFromToken(token);
      const history = await Service.findOneByUser(user._id);
      if (!history) {
        res.sendStatus(404);
        return;
      }
      res.json(history);
    },
    async getOneEntry(req, res) {
      const token = req.headers["authorization"]?.split(" ")[1];
      const user = await securityService.getUserFromToken(token);
      const history = await Service.findOneByUser(user._id);
      if (!history) {
        res.sendStatus(404);
        return;
      }
      const gameStatsId = req.params.id;
      const historyEntry = await Service.findOneEntry(gameStatsId, user._id);
      if (!historyEntry) {
        res.sendStatus(404);
        return;
      }
      res.json(historyEntry);
    },
    async addHistoryEntry(req, res) {
      try {
        const token = req.headers["authorization"]?.split(" ")[1];
        const user = await securityService.getUserFromToken(token);
        const gameStatsId = req.params.id;
        const gameStats = await gameStatsService.findOneById(gameStatsId);

        if (!gameStats) {
          res.sendStatus(404);
          return;
        }
		const userStats = gameStats.stats.find(player => player.user.id = user._id );
		if(!userStats){
			res.sendStatus(404);
			return;
		}
		const historyData = { 
			score: userStats.score,
			lives : userStats.lives,
			rank : userStats.rank,
			gameStatsId : gameStats.id
		}

        const history = await Service.addHistoryEntry(user._id, historyData);
		if(!history){
			res.sendStatus(404);
			return;
		}
        res.status(201).json(history);
      } catch (error) {
        console.log(error);
      }
    },
  };
};
