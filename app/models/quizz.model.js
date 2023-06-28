const mongoose = require("mongoose");

/**
 * Quizz schema
 */

const QuizzSchema = new mongoose.Schema({
	name: { type: String, required: true },
});

/**
 * Methods
 */

QuizzSchema.method({});

/**
 * Statics
 */

QuizzSchema.static({});

module.exports = mongoose.model("Quizz", QuizzSchema);
