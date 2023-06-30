const mongoose = require("mongoose");

/**
 * User schema
 */

const UserSchema = new mongoose.Schema({
	email: {
		type: String,
		required: true,
		unique: true,
		// Regexp to validate emails with more strict rules as added in tests/users.js which also conforms mostly with RFC2822 guide lines
		match: [
			/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
			"Please enter a valid email",
		],
	},
	username: { type: String, required: true },
	password: { type: String, required: true },
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
