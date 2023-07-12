const mongoose = require("mongoose");

/**
 * UserInvitation schema
 */

const UserInvitationSchema = new mongoose.Schema({
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
	invited: {
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

UserInvitationSchema.method({});

/**
 * Statics
 */

UserInvitationSchema.static({});

module.exports = mongoose.model("UserInvitation", UserInvitationSchema);
