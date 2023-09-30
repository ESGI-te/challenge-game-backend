const jwt = require("jsonwebtoken");
const UserService = require("./user.service");
const HistoryService = require("./history.service");
const ValidationError = require("../errors/ValidationError");
const bcrypt = require("bcrypt");
const InventoryService = require("./inventory.service");

module.exports = () => {
	const userService = UserService();
	const historyService = HistoryService();
	const inventoryService = InventoryService();

	return {
		async register(data) {
			try {
				const { password, ...userData } = data;
				const saltRounds = 10;
				const hashedPassword = await bcrypt.hash(password, saltRounds);
				const user = await userService.create({
					...userData,
					password: hashedPassword,
				});
				historyService.create({ userId: user._id });
				inventoryService.create({ userId: user._id });
				return user;
			} catch (error) {
				if (error.name === "ValidationError") {
					throw ValidationError.createFromMongooseError(error);
				}
				throw error;
			}
		},
		async login({ username, password }) {
			try {
				const user = await userService.findOne({ username });

				const passwordIsValid = await bcrypt.compare(password, user.password);

				if (!user || !passwordIsValid) {
					throw new Error("Invalid credentials");
				}

				const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
				return token;
			} catch (error) {
				throw error;
			}
		},

		async getUserFromToken(token) {
			try {
				const userDecoded = jwt.verify(token, process.env.JWT_SECRET);
				const user = await userService.findOneById(userDecoded.id);

				return user?._doc;
			} catch (error) {
				if (error instanceof jwt.JsonWebTokenError) {
					// Handle token verification errors
					throw new Error("Invalid token");
				} else if (error instanceof jwt.TokenExpiredError) {
					// Handle token expiration errors
					throw new Error("Token expired");
				} else {
					throw error;
				}
			}
		},
	};
};
