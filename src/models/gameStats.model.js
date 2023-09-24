const mongoose = require("mongoose");

/**
 * Quizz schema
 */

const GameStatSchema = new mongoose.Schema({
	gameId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Game",
		required: true,
	},
	players: [
		{
			id: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
				required: true,
			},
			username: {
				type: String,
				required: true,
			},
			rank: { type: Number, required: true },
			score: { type: Number, required: true },
			lives: { type: Number, required: true },
		},
	],
	createdAt: {
		type: Date,
	},
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
