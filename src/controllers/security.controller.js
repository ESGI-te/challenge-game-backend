module.exports = (Service, options = {}) => {
	return {
		async register(req, res) {
			try {
				const { username, password, email } = req.body;

				const data = {
					email,
					username,
					password,
				};

				await Service.register(data);

				res.status(201).json({ message: "User registered successfully" });
			} catch (error) {
				res.status(500).json({ message: "Internal server error" });
			}
		},

		async login(req, res) {
			try {
				const token = await Service.login(req.body);

				res.json({ token });
			} catch (error) {
				res.status(401).json({ message: "Authentication failed" });
			}
		},
	};
};
