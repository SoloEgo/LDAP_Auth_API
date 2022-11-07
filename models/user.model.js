const mongoose = require("mongoose");

const User = mongoose.model(
    "User",
    new mongoose.Schema({
        login: String,
        firstDateSingIn: Number,
        lastDateSingIn: Number,
        token: String
    })
)

module.exports = User;