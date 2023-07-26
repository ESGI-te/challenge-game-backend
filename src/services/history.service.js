const ValidationError = require("../errors/ValidationError");
const History = require("../models/history.model");

module.exports = () => {
  return {
    async findAll(criteria, { page = null, itemsPerPage = null, order = {} }) {
      try {
        const historyList = await History.find(criteria)
          .limit(itemsPerPage)
          .skip((page - 1) * itemsPerPage)
          .sort(order);
        return historyList;
      } catch (error) {
        throw error;
      }
    },
    async findOne(id) {
      try {
        const history = await History.findById(id);
        return history;
      } catch (error) {
        console.log(error);
      }
    },
    async findOneByUser(user_id) {
      try {
        const history = await History.findOne({ userId: user_id });
        return history;
      } catch (error) {
        throw error;
      }
    },
    async updateOne(id, newData) {
      try {
        const history = await History.findByIdAndUpdate(id, newData, {
          new: true,
        });
        return history;
      } catch (error) {
        if (error.name === "ValidationError") {
          throw ValidationError.createFromMongooseValidationError(error);
        }
        throw error;
      }
    },
    async deleteOne(id) {
      try {
        await History.findByIdAndDelete(id);
        return true;
      } catch (error) {
        throw error;
      }
    },
    async addHistoryEntry(userId, gameStats) {
      try {
        const history = await History.findOneAndUpdate(
          {
            userId: userId,
            "games.gameStatsId": { $ne: gameStats.gameStatsId },
          },
          { $addToSet: { games: gameStats } },
          { new: true, upsert: true }
        );

        if (!history) {
          throw new Error("Cannot add this entry.");
        }

        return history;
      } catch (error) {
        throw error;
      }
    },
    async findOneEntry(gameStatsId, userId) {
      try {
        const history = await History.findOne({ userId: userId });
        if (!history) {
          console.log("no history");
          return;
        }
        const gameStatsEntry = history.games.find(
          (game) => game.gameStatsId == gameStatsId
        );
        if (!gameStatsEntry) {
          console.log("no game entry");
          return;
        }
        return gameStatsEntry;
      } catch (error) {
        throw error;
      }
    },
    async findLastEntries(userId, number) {
      console.log("heeere")
      try {
        const history = await History.findOne({ userId: userId });
        if (!history) {
          console.log("no history");
          return;
        }

        const gameStatsLastEntries = history.games.slice(-number);

        if (!gameStatsLastEntries) {
          console.log("no game entry");
          return;
        }
        return gameStatsLastEntries;
      } catch (error) {
        throw error;
      }
    },
  };
};
