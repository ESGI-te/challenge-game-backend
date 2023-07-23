const mongoose = require("mongoose");

/**
 * Quizz schema
 */

const QuizzSchema = new mongoose.Schema({
	theme: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: "QuizzTheme",
	},
	name: { type: String, required: true },
	slogan: { type: String, required: true },
	quizz: {
		type: [
			{
				id: { type: Number, required: true },
				question: { type: String, required: true },
				propositions: { type: [String], required: true },
				answer: { type: String, required: true },
				anecdote: { type: String, required: true },
			},
		],
		required: true,
	},
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
