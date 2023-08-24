const SecurityService = require("../services/security.service");

function authRole(allowedRoles) {
	const securityService = SecurityService();

	return async (req, res, next) => {
		try {
			const token = req.headers["authorization"]?.split(" ")[1];
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
