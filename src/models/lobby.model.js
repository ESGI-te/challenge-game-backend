const mongoose = require("mongoose");

/**
 * Lobby schema
 */

const LobbySchema = new mongoose.Schema({
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
			}),
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
		type: new mongoose.Schema({
			playersMax: {
				type: Number,
				default: 5,
			},
			questionTime: {
				type: Number,
				default: 30,
			},
		}),
		required: true,
	},
	themes: [
		{
			type: new mongoose.Schema({
				ranking: {
					type: Number,
				},
				theme: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "QuizzThemes",
					required: true,
				},
			}),
		},
	],
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
