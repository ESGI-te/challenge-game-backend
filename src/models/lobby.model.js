const mongoose = require("mongoose");

/**
 * Lobby schema
 */

const LobbySchema = new mongoose.Schema({
	gameId: {
		type: String,
		required: true,
	},
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
	},
	invitation_code: {
		type: String,
	},
	playersMax: {
		type: Number,
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
