const User = require("../models/user");
const jwt = require("jsonwebtoken");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const verifyToken = jwt.verify(token, process.env.TOKEN_SECRET);
    const user = await User.findOne({
      _id: verifyToken._id,
      "token.token": token,
    });

    if (!user) {
      throw new Error();
    }
    req.token = token;
    req.user = user;
    next();
  } catch (e) {
    res.status(401).send("please Login");
  }
};

module.exports = auth;
