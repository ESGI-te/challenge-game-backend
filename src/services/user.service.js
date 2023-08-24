const ValidationError = require("../errors/ValidationError");
const User = require("../models/user.model");
const UserAchievement = require("../models/userAchievement.model");
const UserAchievementService = require("./userAchievement.service");

module.exports = () => {
	const userAchievementService = UserAchievementService();

	return {
		/** User */
		async findAll(criteria, { page = null, itemsPerPage = null, order = {} }) {
			try {
				const userList = await User.find(criteria)
					.limit(itemsPerPage)
					.skip((page - 1) * itemsPerPage)
					.sort(order);
				return userList;
			} catch (error) {
				throw error;
			}
		},
		async create(data) {
			try {
				const user = await User.create(data);
				await UserAchievement.create({ userId: user._id });

				return user;
			} catch (error) {
				if (error.name === "ValidationError") {
					throw ValidationError.createFromMongooseValidationError(error);
				}
				throw error;
			}
		},
		async findOneById(id) {
			try {
				const user = await User.findById(id);
				return user;
			} catch (error) {
				throw error;
			}
		},
		async findOne(criteria) {
			try {
				const user = await User.findOne(criteria);
				return user;
			} catch (error) {
				throw error;
			}
		},
		async replaceOne(id, newData) {
			try {
				const deleted = await this.deleteOne(id);
				const user = await this.create({ ...newData, _id: id });

				return [user, !deleted];
			} catch (error) {
				if (error.name === "ValidationError") {
					throw ValidationError.createFromMongooseValidationError(error);
				}
				throw error;
			}
		},
		async updateOne(id, newData) {
			try {
				const user = await User.findByIdAndUpdate(id, newData, {
					new: true,
				});
				return user;
			} catch (error) {
				if (error.name === "ValidationError") {
					throw ValidationError.createFromMongooseValidationError(error);
				}
				throw error;
			}
		},
		async deleteOne(id) {
			try {
				await User.findByIdAndDelete(id);
				return true;
			} catch (error) {
				throw error;
			}
		},
		/** Friend */
		async addFriend(id, friendId) {
			try {
				const result = await User.updateOne(
					{ _id: id, "friends.id": { $ne: friendId } },
					{ $addToSet: { friends: friendId } }
				);

				await userAchievementService.updateAchievementProgress(id, "friends_1");

				return result.nModified > 0;
			} catch (error) {
				throw error;
			}
		},
		async removeFriend(id, friendId) {
			try {
				const result = await User.updateOne(
					{ _id: id },
					{ $pull: { friends: friendId } }
				);
				return result.nModified > 0;
			} catch (error) {
				throw error;
			}
		},
		async findFriends(
			friendsIds,
			{ page = null, itemsPerPage = null, order = {} }
		) {
			try {
				const userList = await User.find({ _id: { $in: friendsIds } })
					.select("_id username")
					.limit(itemsPerPage)
					.skip((page - 1) * itemsPerPage)
					.sort(order)
					.lean();

				return userList;
			} catch (error) {
				throw error;
			}
		},
	};
};
