const mongoose = require("mongoose");

/**
 * QuizzTheme schema
 */

const QuizzThemeSchema = new mongoose.Schema({
	name: { type: String, required: true },
	description: { type: String, required: false },
	price: { type: Number, default: 0 },
});

/**
 * Methods
 */

QuizzThemeSchema.method({});

/**
 * Statics
 */

QuizzThemeSchema.static({});

module.exports = mongoose.model("QuizzTheme", QuizzThemeSchema);
