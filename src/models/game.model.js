const mongoose = require("mongoose");

/**
 * Game schema
 */

const GameSchema = new mongoose.Schema(
	{
		code: {
			type: String,
			required: true,
		},
		players: [
			{
				type: new mongoose.Schema(
					{
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
						rank: {
							type: Number,
						},
					},
					{ _id: false }
				),
			},
		],
		settings: {
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
		owner: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
		questions: [
			{
				id: { type: Number },
				question: { type: String, required: true },
				propositions: { type: [String], required: true },
				answer: { type: String, required: true },
			},
		],
	},
	{ timestamps: true }
);

/**
 * Methods
 */

GameSchema.method({});

/**
 * Statics
 */

GameSchema.static({});

module.exports = mongoose.model("Game", GameSchema);
