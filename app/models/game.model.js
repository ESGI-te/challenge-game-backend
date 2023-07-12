const mongoose = require("mongoose");

/**
 * Game schema
 */

const GameSchema = new mongoose.Schema({
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
	invitationCode: {
		type: String,
	},
	playersMax: {
		type: Number,
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
