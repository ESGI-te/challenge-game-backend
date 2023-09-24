const mongoose = require("mongoose");

/**
 * Lobby schema
 */

const LobbySchema = new mongoose.Schema({
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
				},
				{ _id: false }
			),
		},
	],
	owner: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	invitation_code: {
		type: String,
		required: true,
	},
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
	},
	themes: [
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
				ref: "QuizzTheme",
				required: true,
			},
		},
	],
	votedTheme: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "QuizzTheme",
		default: null,
	},
});

/**
 * Methods
 */

LobbySchema.method({});

/**
 * Statics
 */

LobbySchema.static({});

module.exports = mongoose.model("Lobby", LobbySchema);
