const mongoose = require("mongoose");

/**
 * Game schema
 */

const GameSchema = new mongoose.Schema({
	isStarted: {
		type: Boolean,
		default: false,
	},
	code: {
		type: String,
		required: true,
	},
	theme: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "QuizzTheme",
		default: null,
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
				},
				{ _id: false }
			),
		},
	],
	settings: {
		type: new mongoose.Schema(
			{
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
			},
			{ _id: false }
		),
		required: true,
	},
	themes: [
		{
			type: new mongoose.Schema(
				{
					voters: [
						{
							type: mongoose.Schema.Types.ObjectId,
							ref: "User",
							default: [],
						},
					],
					name: {
						type: String,
						required: true,
					},
					id: {
						type: mongoose.Schema.Types.ObjectId,
						ref: "QuizzThemes",
						required: true,
					},
				},
				{ _id: false }
			),
		},
	],
	owner: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
	},
	currentQuestion: {
		type: Object,
		default: null,
	},
	currentQuestionStartTime: {
		type: Date,
	},
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
