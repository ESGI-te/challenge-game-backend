module.exports = function (connection) {
	const { DataTypes, Model } = require("sequelize");

	class User extends Model {}

	User.init(
		{
			firstname: DataTypes.STRING,
			lastname: DataTypes.STRING,
			email: {
				type: DataTypes.STRING,
				validate: {
					isEmail: true,
				},
				allowNull: false,
				unique: true,
			},
			password: {
				type: DataTypes.STRING,
				allowNull: false,
				validate: {
					//len: [8, 32],
					//is: /^[a-zA-Z0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+$/i,
				},
			},
		},
		{
			tableName: "users",
			sequelize: connection,
			//timestamps: false,
			//paranoid: true // soft delete
		}
	);

	return User;
};
