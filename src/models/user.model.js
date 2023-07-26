const mongoose = require("mongoose");
const { USER_ROLES } = require("../utils/constants");

/**
 * User schema
 */

const UserSchema = new mongoose.Schema({
	email: {
		type: String,
		required: true,
		unique: true,
		match: [
			/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
			"Please enter a valid email",
		],
	},
	username: { type: String, required: true, unique: true },
	password: { type: String, required: true },
	imageUrl: {type: String},
	inventoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Inventory", required: true },
	roles: {
		type: [String],
		required: true,
		enum: Object.values(USER_ROLES),
		default: [USER_ROLES.USER],
	},
	friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", default: [] }],
});

/**
 * Methods
 */

UserSchema.methods = {};

/**
 * Statics
 */

UserSchema.statics = {};

const User = mongoose.model("User", UserSchema);

module.exports = User;
