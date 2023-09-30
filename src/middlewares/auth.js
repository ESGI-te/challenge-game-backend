const jwt = require("jsonwebtoken");
const userService = require("../services/user.service")();

const authGuard = (req, res, next) => {
	const authHeader = req.headers["authorization"];
	const token = authHeader && authHeader.split(" ")[1];

	if (!token) {
		return res.status(401).json({ message: "Unauthorized access" });
	}

	jwt.verify(token, process.env.JWT_SECRET, async (err, jwtUser) => {
		const user = await userService.findOneById(jwtUser.id);

		if (err || !user) {
			return res.status(403).json({ message: "Invalid or expired token" });
		}

		req.user = user;
		next();
	});
};

module.exports = authGuard;
