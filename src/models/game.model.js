const mongoose = require("mongoose");

/**
 * Game schema
 */

const GameSchema = new mongoose.Schema({
  players: [
    {
      type: new mongoose.Schema({
        username: {
          type: String,
          required: true,
        },
        id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        score: {
          type: Number,
          default: 0,
        },
        lives: {
          type: Number,
          default: 3,
        },
      }),
    },
  ],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  invitationCode: {
    type: String,
  },
  playersMax: {
    type: Number,
  },
  currentQuestion: {
    type: Object,
  },
  currentQuestionStartTime: {
    type: Date,
  },
  votedCategories: [
    {
      type: String,
    },
  ],
});

/**
 * Methods
 */

GameSchema.method({});

/**
 * Statics
 */

GameSchema.static({});

module.exports = mongoose.model("Game", GameSchema);