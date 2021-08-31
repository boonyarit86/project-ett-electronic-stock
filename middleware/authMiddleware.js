const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }
  try {
    const token = req.headers.authorization.split(" ")[1]; // Authorization: 'Bearer TOKEN'
    // console.log(token)
    if (!token) {
      res.status(401).send("Unauthorized");
    }
    const { userId } = jwt.verify(token, process.env.JWT_KEY);
    req.userId = userId;
    next();
  } catch (error) {
    // console.log(error);
    res.status(500).send("Token is not valid");
  }
};

