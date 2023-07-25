const mongoose = require("mongoose");

/**
 * Quizz schema
 */

const HistorySchema = new mongoose.Schema({
  games: [
    {
      gameStatsId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "GameStats",
        required: true,
      },
      rank: { type : Number, required: true },
      score : { type : Number, required: true },
      lives : { type : Number, required: true }
    },
  ],
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
});

/**
 * Methods
 */

HistorySchema.method({});

/**
 * Statics
 */

HistorySchema.static({});

module.exports = mongoose.model("History", HistorySchema);
