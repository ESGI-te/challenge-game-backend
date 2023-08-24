const mongoose = require("mongoose");

/**
 * Quizz schema
 */

const UserAchievementSchema = new mongoose.Schema({
	achievements: [
		{
			id: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "Achievement",
				required: true,
			},
			progress: { type: Number },
			achieved: { type: Boolean, default: false },
		},
	],
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true,
		unique: true,
	},
	createdAt: { type: Date, required: true, default: Date.now() },
});

/**
 * Methods
 */

UserAchievementSchema.method({});

/**
 * Statics
 */

UserAchievementSchema.static({});

module.exports = mongoose.model("UserAchievement", UserAchievementSchema);
