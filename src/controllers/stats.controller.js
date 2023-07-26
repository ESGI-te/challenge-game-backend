const SecurityService = require("../services/security.service");

module.exports = (Service, options = {}) => {
    const securityService = SecurityService();

  return {
    async getAverage(req, res) {
      try {
        const token = req.headers["authorization"]?.split(" ")[1];
        const user = await securityService.getUserFromToken(token);
        const days = req.query.days;
        const avgScore = await Service.getStatsWithAverage(user._id, days);
        if (!avgScore) {
          res.sendStatus(404);
          return;
        }
        res.json(avgScore);
      } catch (error) {
        console.log(error);
        res.sendStatus(500);
      }
    },
  };
};
