const ValidationError = require("../errors/ValidationError");

module.exports = function (error, req, res, next) {
  console.error(error);
  if (error instanceof ValidationError) {
    res.status(422).json(error.errors);
  } else {
    res.sendStatus(500);
  }
};
