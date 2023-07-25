const mongoose = require("mongoose");

/**
 * GameInvitation schema
 */

const GameInvitationSchema = new mongoose.Schema({
	invitation_code: {
		type: String,
		required: true,
	},
	inviter: {
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
	recipient: {
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
});

/**
 * Methods
 */

GameInvitationSchema.method({});

/**
 * Statics
 */

GameInvitationSchema.static({});

module.exports = mongoose.model("GameInvitation", GameInvitationSchema);
