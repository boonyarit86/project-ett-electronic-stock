module.exports = (req, res, next) => {
  req.body.role = undefined;
  next();
};