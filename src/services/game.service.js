const ValidationError = require("../errors/ValidationError");
const Game = require("../models/game.model");

module.exports = function () {
  return {
    async findAll(criteria, { page = null, itemsPerPage = null, order = {} }) {
      try {
        const gameList = await Game.find(criteria)
          .limit(itemsPerPage)
          .skip((page - 1) * itemsPerPage)
          .sort(order);
        return gameList;
      } catch (error) {
        throw error;
      }
    },
    async create(data) {
      try {
        const game = await Game.create(data);
        return game;
      } catch (error) {
        if (error.name === "ValidationError") {
          throw ValidationError.createFromMongooseValidationError(error);
        }
        throw error;
      }
    },
    async findOne(id) {
      try {
        const game = await Game.findById(id);
        return game;
      } catch (error) {
        throw error;
      }
    },
    async updateOne(id, newData) {
      try {
        const game = await Game.findByIdAndUpdate(id, newData, {
          new: true,
        });
        return game;
      } catch (error) {
        if (error.name === "ValidationError") {
          throw ValidationError.createFromMongooseValidationError(error);
        }
        throw error;
      }
    },
    async deleteOne(id) {
      try {
        await Game.findByIdAndDelete(id);
        return true;
      } catch (error) {
        throw error;
      }
    },
    async addPlayer(gameId, player) {
      const playerId = player.id;
      const username = player.username;

      try {
        if (!mongoose.Types.ObjectId.isValid(gameId)) {
          throw new Error("Invalid gameId");
        }

        const game = await game.findOneAndUpdate(
          { _id: gameId, "players.id": { $ne: playerId } },
          { $addToSet: { players: { id: playerId, username } } },
          { new: true }
        );

        return game;
      } catch (error) {
        throw error;
      }
    },
    async removePlayer(gameId, playerId) {
      try {
        if (!mongoose.Types.ObjectId.isValid(gameId)) {
          throw new Error("Invalid gameId");
        }
        const game = await game.findOneAndUpdate(
          { _id: gameId },
          { $pull: { players: { id: playerId } } },
          { new: true }
        );

        return game;
      } catch (error) {
        throw error;
      }
    },

    async getAlivePlayers(gameId) {
      try {
        const game = await this.findOne(gameId);
        const alivePlayers = game.players.filter((player) => player.lives > 0);
        return alivePlayers;
      } catch (error) {
        throw error;
      }
    },
    async voteCategory(gameId, userId, category) {
      try {
        const game = await Game.findById(gameId);

        // If category has not been voted yet
        if (!game.votedCategories.includes(category)) {
          game.votedCategories.push(category);
        }

        await game.save();

        return game;
      } catch (error) {
        throw error;
      }
    },
    async getVotedCategories(gameId) {
      try {
        const game = await Game.findById(gameId);
        return game.votedCategories;
      } catch (error) {
        throw error;
      }
    },
    async getWinningCategory(gameId) {
      try {
        const game = await Game.findById(gameId);
        if (game.votedCategories.length === 0) {
          return null;
        }

        const counts = game.votedCategories.reduce((acc, curr) => {
          if (curr in acc) {
            acc[curr]++;
          } else {
            acc[curr] = 1;
          }
          return acc;
        }, {});

        const sortedCategories = Object.keys(counts).sort(
          (a, b) => counts[b] - counts[a]
        );
        const winningCategory = sortedCategories[0];
        return winningCategory;
      } catch (error) {
        throw error;
      }
    },
    async checkAnswer(gameId, questionId, answer) {
      try {
        const game = await this.findOne(gameId);
        return (
          game.currentQuestion.id === questionId &&
          game.currentQuestion.answer === answer
        );
      } catch (error) {
        throw error;
      }
    },
    async getQuestionStartTime(gameId) {
      try {
        const game = await this.findOne(gameId);
        return game.currentQuestionStartTime;
      } catch (error) {
        throw error;
      }
    },
    async getNextQuestion(gameId) {
      try {
        const game = await this.findOne(gameId);
        const currentQuestionIndex = game.currentQuestionIndex || 0;
        if (currentQuestionIndex < game.quizz.length) {
          const question = game.quizz[currentQuestionIndex];
          return question;
        } else {
          return null;
        }
      } catch (error) {
        throw error;
      }
    },
    async startQuestionTimer(gameId, question) {
      try {
        return await Game.findByIdAndUpdate(
          gameId,
          { currentQuestion: question, currentQuestionStartTime: new Date() },
          { new: true }
        );
      } catch (error) {
        throw error;
      }
    },
    async incrementScore(gameId, userId, increment) {
      try {
        return await Game.findOneAndUpdate(
          { _id: gameId, "players.id": userId },
          { $inc: { "players.$.score": increment } },
          { new: true }
        );
      } catch (error) {
        throw error;
      }
    },
    async decrementLives(gameId, userId) {
      try {
        return await Game.findOneAndUpdate(
          { _id: gameId, "players.id": userId },
          { $inc: { "players.$.lives": -1 } },
          { new: true }
        );
      } catch (error) {
        throw error;
      }
    },
    async getLives(gameId, userId) {
      try {
        const game = await Game.findOne({ _id: gameId, "players.id": userId });
        const player = game.players.find(
          (player) => player.id.toString() === userId
        );
        return player.lives;
      } catch (error) {
        throw error;
      }
    },
    async eliminatePlayer(gameId, userId) {
      try {
        return await Game.findOneAndUpdate(
          { _id: gameId },
          { $pull: { players: { id: userId } } },
          { new: true }
        );
      } catch (error) {
        throw error;
      }
    },
    async getWinner(gameId) {
      try {
        const game = await this.findOne(gameId);
        const sortedPlayers = game.players.sort((a, b) => b.score - a.score);
        return sortedPlayers.slice(0, 10);
      } catch (error) {
        throw error;
      }
    },
  };
};
