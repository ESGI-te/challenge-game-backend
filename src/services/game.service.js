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
        const game = await Game.findOneAndUpdate(
          { _id: gameId, "players.id": { $ne: playerId } },
          {
            $addToSet: {
              players: {
                id: playerId,
                username: username,
                score: score,
                lives: lives,
              },
            },
          },
          { new: true }
        );

        return game?.players;
      } catch (error) {
        throw error;
      }
    },
    async findOneByCode(code) {
      try {
        const game = await Game.findOne({ code });
        return game;
      } catch (error) {
        throw error;
      }
    },
    async removePlayer(gameId, playerId) {
      try {
        const game = await Game.findOneAndUpdate(
          { _id: gameId },
          { $pull: { players: { id: playerId } } },
          { new: true }
        );
        return game?.players;
      } catch (error) {
        throw error;
      }
    },
    async updateCurrentQuestion(gameId, question) {
      try {
        const game = await this.findOne(gameId);
        if (!game) {
          throw new Error(`Game not found for gameId: ${gameId}`);
        }

        game.currentQuestion = question;
        await game.save();

        return game;
      } catch (error) {
        throw error;
      }
    },
    async getCurrentQuestion(gameId) {
      try {
        const game = await this.findOne(gameId);
        if (!game) {
          throw new Error(`Game not found for gameId: ${gameId}`);
        }

        return game.currentQuestion;
      } catch (error) {
        throw error;
      }
    },

    async checkAnswer(gameId, questionId, answer) {
      try {
        let game = await this.findOne(gameId);
        console.log("this is the game", game);
        if (!game || !game.currentQuestion) {
          console.error(
            `Game or current question not found for gameId: ${gameId}`
          );
          return false;
        }
        const questionNumberId = Number(questionId);

        const isValid =
          game.currentQuestion.id === questionNumberId &&
          game.currentQuestion.answer.trim().toLowerCase() ===
            answer.trim().toLowerCase();
        console.log("Answer from client:", answer);
        console.log("Answer validation result:", isValid);

        game = await this.findOne(gameId);

        return isValid;
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
          { _id: gameId, "players.id": userId },
          { $inc: { "players.$.score": +1 } },
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

        const player = game.players.find((player) => {
          console.log(player.id.toString(), userId.toString());
          return player.id.toString() === userId.toString();
        });

        if (!player) {
          throw new Error(`Player not found for userId: ${userId}`);
        }
        return player.lives;
      } catch (error) {
        throw error;
      }
    },
    async eliminatePlayer(gameId, userId) {
      console.log(gameId);
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
    async getAlivePlayers(gameId) {
      try {
        const game = await this.findOne(gameId);
        const alivePlayers = game.players.filter((player) => player.lives > 0);
        return alivePlayers;
      } catch (error) {
        throw error;
      }
    },
    async getAllPlayers(gameId) {
      try {
        const game = await this.findOne(gameId);
        return game.players;
      } catch (error) {
        throw error;
      }
    },
    rankPlayers(players) {
      // Sort players in descending order of scores
      players.sort((a, b) => b.score - a.score);

      // Assign ranks to players
      players.forEach((player, index) => {
        player.rank = index + 1;
      });

      return players;
    },
    async getWinner(gameId) {
      try {
        const getAllPlayers = await this.getAllPlayers(gameId);
        console.log("this is getAllPlayers ", getAllPlayers);
        if (!Array.isArray(getAllPlayers) || getAllPlayers.length === 0) {
          console.warn("No alive players found for game ID:", gameId);
          return [];
        }

        const sortedPlayers = this.alivePlayers.sort(
          (a, b) => b.score - a.score
        );

        let rank = 1;
        let prevScore = sortedPlayers[0].score;

        for (let i = 0; i < sortedPlayers.length; i++) {
          if (sortedPlayers[i].score !== prevScore && i !== 0) {
            rank++;
          }

          sortedPlayers[i].rank = rank;
          prevScore = sortedPlayers[i].score;
        }

        return sortedPlayers;
      } catch (error) {
        console.error("Error in getWinner:", error);
        throw error;
      }
    },
    async setCurrentQuestion(gameId, question) {
      try {
        const game = await Game.findOneAndUpdate(
          { _id: gameId },
          { currentQuestion: question, currentQuestionStartTime: new Date() },
          { new: true }
        );

        if (!game) {
          throw new Error(`Game not found`);
        }

        return game?.currentQuestion;
      } catch (error) {
        throw error;
      }
    },
    async startGame(gameId) {
      try {
        const game = await Game.findByIdAndUpdate(
          gameId,
          { isStarted: true },
          { new: true }
        );

        if (!game) {
          throw new Error(`Game not found`);
        }

        return game.isStarted;
      } catch (error) {
        throw error;
      }
    },
  };
};
