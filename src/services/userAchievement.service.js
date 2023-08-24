const dayjs = require("dayjs");
const ValidationError = require("../errors/ValidationError");
const UserAchievement = require("../models/userAchievement.model");
const AchievementService = require("./achievement.service");

module.exports = () => {
	const achievementService = AchievementService();

	return {
		async findAll(criteria, { page = null, itemsPerPage = null, order = {} }) {
			try {
				const userAchievementList = await UserAchievement.find(criteria)
					.limit(itemsPerPage)
					.skip((page - 1) * itemsPerPage)
					.sort(order)
					.exec();
				return userAchievementList;
			} catch (error) {
				throw error;
			}
		},
		async findOne(id) {
			try {
				const userAchievement = await UserAchievement.findById(id);
				return userAchievement;
			} catch (error) {
				console.log(error);
			}
		},
		async findOneByUser(userId) {
			try {
				const userAchievement = await UserAchievement.findOne({ userId });
				return userAchievement;
			} catch (error) {
				throw error;
			}
		},
		async updateOne(id, newData) {
			try {
				const userAchievement = await UserAchievement.findByIdAndUpdate(
					id,
					newData,
					{
						new: true,
					}
				);
				return userAchievement;
			} catch (error) {
				if (error.name === "ValidationError") {
					throw ValidationError.createFromMongooseValidationError(error);
				}
				throw error;
			}
		},
		async deleteOne(id) {
			try {
				await UserAchievement.findByIdAndDelete(id);
				return true;
			} catch (error) {
				throw error;
			}
		},
		async updateAchievementProgress(userId, achievementName) {
			try {
				const achievement = await achievementService.findOne({
					name: achievementName,
				});

				if (!achievement) throw new Error("Achievement not found");

				const userAchievement = await UserAchievement.findOne({
					userId,
				});

				if (!userAchievement) throw new Error("User achievement not found");

				const achievementIndex = userAchievement?.achievements?.findIndex(
					(s) => s.id.toString() === achievement._id.toString()
				);

				if (achievementIndex !== -1) {
					if (userAchievement.achievements[achievementIndex].achieved) return;

					const progress =
						userAchievement.achievements[achievementIndex].progress;

					if (progress === achievement.goal) return;

					const newProgress = progress + 1;
					userAchievement.achievements[achievementIndex].progress = newProgress;
					userAchievement.achievements[achievementIndex].achieved =
						newProgress === achievement.goal;
					await userAchievement.save();
					return;
				}

				const newAchievement = {
					id: achievement._id,
					progress: 1,
					achieved: false,
				};

				await UserAchievement.updateOne(
					{ userId },
					{ $push: { achievements: newAchievement } }
				);
				return;
			} catch (error) {
				throw error;
			}
		},
		async addAchievement(userId, achievementName) {
			try {
				const achievement = achievementService.findOne({
					name: achievementName,
				});

				if (!achievement) throw new Error("Achievement not found");

				const newAchievement = {
					id: achievement.id,
					progress: 0,
					achieved: true,
					name: achievementName,
				};

				await UserAchievement.updateOne(
					{ userId },
					{ $push: { achievements: newAchievement } }
				);

				return;
			} catch (error) {
				throw error;
			}
		},
	};
};
