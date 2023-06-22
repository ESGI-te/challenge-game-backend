class ValidationError extends Error {
	constructor(errors, previous) {
		super("Validation error");
		this.errors = errors;
		this.previous = previous;
	}
}
ValidationError.createFromSequelizeValidationError = function (error) {
	const errors = error.errors.reduce((acc, errorItem) => {
		if (!acc[errorItem.path]) {
			acc[errorItem.path] = [];
		}
		acc[errorItem.path].push(errorItem.message);
		return acc;
	}, {});
	return new ValidationError(errors, error);
};

module.exports = ValidationError;
