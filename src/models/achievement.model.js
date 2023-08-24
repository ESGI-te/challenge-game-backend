const mongoose = require("mongoose");

/**
 * Success schema
 */

const SuccessSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
	label: {
		type: String,
		required: true,
	},
	description: {
		type: String,
		required: true,
	},
	goal: { type: Number },
	createdAt: { type: Date, required: true, default: Date.now() },
});

/**
 * Methods
 */

SuccessSchema.method({});

/**
 * Statics
 */

SuccessSchema.static({});

module.exports = mongoose.model("Success", SuccessSchema);
