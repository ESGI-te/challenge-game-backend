const mongoose = require("mongoose");

/**
 * Quizz schema
 */

const GameStatSchema = new mongoose.Schema({
  stats: [
    {
      type: new mongoose.Schema(
        {
          user: {
            id: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "User",
              required: true,
              unique: true,
            },
            username: {
              type: String,
              required: true,
              unique: true,
            },
          },
          rank: { type: Number, required: true },
          score: { type: Number, required: true },
          lives: { type: Number, required: true },
        },
        { _id: false }
      ),
    },
  ],
});

/**
 * Methods
 */

GameStatSchema.method({});

/**
 * Statics
 */

GameStatSchema.static({});

module.exports = mongoose.model("GameStats", GameStatSchema);
