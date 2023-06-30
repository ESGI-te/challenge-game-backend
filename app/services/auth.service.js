const jwt = require("jsonwebtoken");
const UserService = require("../services/user.service");
const ValidationError = require("../errors/ValidationError");
const bcrypt = require("bcrypt");
const userService = new UserService();

module.exports = function () {
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
        return user;
      } catch (error) {
        if (error.name === "ValidationError") {
          throw ValidationError.createFromMongooseError(error);
        }
        throw error;
      }
    },

    async login(credentials) {
      try {
        const { username, email, password } = credentials;
        const credential = username ? { username } : { email };
        const user = await userService.findOne(credential);

        const passwordIsValid = bcrypt.compare(password, user.password);

        if (!user || !passwordIsValid) {
          throw new Error("Invalid credentials");
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        return token;
      } catch (error) {
        throw error;
      }
    },
  };
};
