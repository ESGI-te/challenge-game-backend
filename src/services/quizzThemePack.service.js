const ValidationError = require("../errors/ValidationError");
const ThemePack = require("../models/quizzThemePack.model");

module.exports = () => {
  return {
    async findAll(criteria, { page = null, itemsPerPage = null, order = {} }) {
      try {
        const themes = await ThemePack.find(criteria)
          .limit(itemsPerPage)
          .skip((page - 1) * itemsPerPage)
          .sort(order)
          .exec();
        return themes;
      } catch (error) {
        throw error;
      }
    },
    async create(data) {
      try {
        const theme = await ThemePack.create(data);
        return theme;
      } catch (error) {
        if (error.name === "ValidationError") {
          throw ValidationError.createFromMongooseValidationError(error);
        }
        throw error;
      }
    },
    async findOneById(id) {
      try {
        const theme = await ThemePack.findById(id);
        return theme;
      } catch (error) {
        throw error;
      }
    },
    async findOneByName(name) {
			try {
				const quizzThemePack = await ThemePack.findOne({name: name});
				return quizzThemePack;
			} catch (error) {
				throw error;
			}
		},
    async replaceOne(id, newData) {
      try {
        const deleted = await this.deleteOne(id);
        const theme = await this.create({ ...newData, _id: id });

        return [theme, !deleted];
      } catch (error) {
        if (error.name === "ValidationError") {
          throw ValidationError.createFromMongooseValidationError(error);
        }
        throw error;
      }
    },
    async updateOne(id, newData) {
      try {
        const theme = await ThemePack.findByIdAndUpdate(id, newData, {
          new: true,
        });
        return theme;
      } catch (error) {
        if (error.name === "ValidationError") {
          throw ValidationError.createFromMongooseValidationError(error);
        }
        throw error;
      }
    },
    async deleteOne(id) {
      try {
        await ThemePack.findByIdAndDelete(id);
        return true;
      } catch (error) {
        throw error;
      }
    },
  };
};
