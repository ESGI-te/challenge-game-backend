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
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
	],
	owner: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
	},
	invitation_code: {
		type: String,
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
