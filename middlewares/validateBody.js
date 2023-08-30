const { HttpError } = require("../helpers");

const validateBody = (schema) => {
  const func = (req, res, next) => {
    if (req.method === "PUT" && Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: "missing fields" });
    }

    if (req.method === "PATCH" && Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: "missing field favorite" });
    }

    const { error } = schema.validate(req.body);
    if (error) {
      next(HttpError(400, error.message));
    }
    next();
  };
  return func;
};

module.exports = validateBody;