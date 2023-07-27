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
						ref: "QuizzTheme",
						required: true,
					},
				},
				{ _id: false }
			),
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
