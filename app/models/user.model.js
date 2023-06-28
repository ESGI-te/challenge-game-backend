const mongoose = require("mongoose");

/**
 * User schema
 */

const UserSchema = new mongoose.Schema({
	firstname: { type: String, required: true },
	lastname: String,
	email: {
		type: String,
		required: true,
		unique: true,
		validate: {
			validator: (value) => validator.isEmail(value),
			message: "Invalid email",
		},
	},
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
