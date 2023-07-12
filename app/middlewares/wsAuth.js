const jwt = require("jsonwebtoken");

const wsAuthGuard = (socket, next) => {
	const token = socket.handshake.auth.token;

	if (!token) {
		return next(new Error("Unauthorized access"));
	}

	jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
		if (err) {
			return next(new Error("Invalid or expired token"));
		}
		next();
	});
};

module.exports = wsAuthGuard;
