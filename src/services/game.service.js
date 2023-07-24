const ValidationError = require("../errors/ValidationError");
const Game = require("../models/game.model");
const mongoose = require("mongoose");
const QuizzTheme = require("../models/quizzTheme.model");
const Quizz = require("../models/quizz.model");

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
      const playerId = player._id;
      const username = player.username;
      const score = 0;
      const lives = 3;

      try {
        if (!mongoose.Types.ObjectId.isValid(gameId)) {
          throw new Error("Invalid gameId");
        }

        const game = await Game.findOneAndUpdate(
          { _id: gameId, "players._id": { $ne: playerId } },
          {
            $addToSet: {
              players: {
                _id: playerId,
                username: username,
                score: score,
                lives: lives,
              },
            },
          },
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
        const updatedGame = await Game.findOneAndUpdate(
          { _id: gameId },
          { $pull: { players: { _id: playerId } } },
          { new: true }
        );

        return updatedGame;
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
    async checkAnswer(gameId, questionId, answer) {
      try {
        const game = await this.findOne(gameId);
        return (
          game.currentQuestion._id === questionId &&
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

    async getQuestionsForPopularTheme(gameId) {
      try {
        const game = await Game.findById(gameId);
        if (!game) {
          throw new Error("Game not found");
        }
        const popularTheme = game.themes.sort(
          (a, b) => b.voters.length - a.voters.length
        )[0];
        const quizzes = await Quizz.find({ theme: popularTheme.id });
        if (!quizzes) {
          throw new Error("No quizzes found for this theme");
        }

        return quizzes;
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
    //test
    async getNextQuestionForTheme(gameId, themeId) {
      try {
        const game = await this.findOne(gameId);
        const theme = await QuizzTheme.findById(themeId);
        const currentQuestionIndex = game.currentQuestionIndex || 0;
        const quizForTheme = game.quizz.filter((quiz) =>
          quiz.theme.equals(themeId)
        );

        if (currentQuestionIndex < quizForTheme.length) {
          const question = quizForTheme[currentQuestionIndex];
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
          { _id: gameId, "players._id": userId },
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
          { _id: gameId, "players._id": userId },
          { $inc: { "players.$.lives": -1 } },
          { new: true }
        );
      } catch (error) {
        throw error;
      }
    },
    async getLives(gameId, userId) {
      try {
        const game = await Game.findOne({ _id: gameId, "players._id": userId });
        const player = game.players.find(
          (player) => player._id.toString() === userId
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
          { $pull: { players: { _id: userId } } },
          { new: true }
        );
      } catch (error) {
        throw error;
      }
    },
    async getWinner(gameId) {
      try {
        const game = await this.findOne(gameId);
        if (!game || !game.players || game.players.length === 0) {
          return null;
        }
        const sortedPlayers = game.players.sort((a, b) => b.score - a.score);
        const highestScore = sortedPlayers[0].score;
        const winners = sortedPlayers.filter(
          (player) => player.score === highestScore
        );
        return winners;
      } catch (error) {
        throw error;
      }
    },
  };
};
