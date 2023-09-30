const mongoose = require("mongoose");

/**
 * Quizz schema
 */

const GameStatSchema = new mongoose.Schema({
	gameSettings: {
		playersMax: {
			type: Number,
			default: 5,
		},
		questionTime: {
			type: Number,
			default: 30,
		},
		lives: {
			type: Number,
			default: 3,
			required: true,
		},
		difficulty: {
			type: Number,
			default: 1,
		},
		nbQuestions: {
			type: Number,
			default: 15,
		},
		theme: {
			id: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "QuizzTheme",
				required: true,
			},
			name: {
				type: String,
				required: true,
			},
		},
	},
	code: {
		type: String,
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
