const mongoose = require("mongoose");

/**
 * Quizz schema
 */

const QuizzSchema = new mongoose.Schema({
	difficulty: {
		type: Number,
		required: true,
	},
	theme: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: "QuizzTheme",
	},
	name: { type: String, required: true, unique: true },
	slogan: { type: String, required: true },
	questions: [
		{
			id: { type: Number },
			question: { type: String, required: true },
			propositions: { type: [String], required: true },
			answer: { type: String, required: true },
		},
	],
});

/**
 * Pre-save middleware to increment the question id
 */

QuizzSchema.pre("save", function (next) {
	if (this.isNew) {
		// Increment the question id for each question in the quizz array
		this.quizz.forEach((question, index) => {
			question.id = index + 1;
		});
	}
	next();
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
