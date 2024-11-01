const mongoose = require("mongoose");

const User = mongoose.model("User", {
    email: {type: String, unique: true},
    account: {
      username: {type: String, required: true},
      avatar: Object,
    },
    newsletter: Boolean,
    token: {type: String, required: true},
    hash: {type: String, required: true},
    salt: {type: String, required: true},
});

module.exports = User;
