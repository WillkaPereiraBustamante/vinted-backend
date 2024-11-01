const User = require("../models/User.js");

const isAuthenticated = async (req, res, next) => {
  
    const token = req.headers.authorization.replace("Bearer ", "");
    const user = await User.findOne({ token: token }).select("-salt -hash");
    if (!user){
      return res.status(401).json({ message: "unauthorized"});
    }
    req.user = user;
    return next();
  };
  
  module.exports = isAuthenticated;
  