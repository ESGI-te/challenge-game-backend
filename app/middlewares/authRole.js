const SecurityService = require("../services/security.service");

function authRole(allowedRoles) {
	const securityService = new SecurityService();

	return async (req, res, next) => {
		try {
			const authHeader = req.headers["authorization"];
			const token = authHeader && authHeader.split(" ")[1]; // Remove Bearer from string

			const user = await securityService.getUserFromToken(token);

			if (user && user.roles.includes(allowedRoles)) {
				req.user = user;
				next();
			} else {
				res.status(403).json({ message: "Access denied" });
			}
		} catch (error) {
			next(error);
		}
	};
}

module.exports = authRole;
