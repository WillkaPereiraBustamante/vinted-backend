const express = require("express");
const User = require("../models/User.js");
const router = express.Router();

const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary").v2;
const convertToBase64 = (file) => {
    return `data:${file.mimetype};base64,${file.data.toString("base64")}`;
};

// CREATE USER

router.post("/user/signup", fileUpload(), async (req, res) => {
    try {
        const picture = req.files.avatar;
        const fileConverted = await cloudinary.uploader.upload(convertToBase64(picture));
        const salt = uid2(16);
        const hash = SHA256(req.body.password + salt).toString(encBase64);
        const token = uid2(64);
        const existingEmail = await User.findOne({ email: req.body.email });

        if (existingEmail){
            return res.status(409).json({ message: "email already used"});
        };
        if (!req.body.username || !req.body.email || !req.body.password){
            return res.status(400).json({ message: "Missing parameters"});
        };

        const newUser = new User({
            account:{
                username: req.body.username,
                avatar: fileConverted,
            },
            email: req.body.email,
            password: req.body.password,
            newsletter: req.body.newsletter,
            token: token,
            hash: hash,
            salt: salt
        });
        
        await newUser.save();
        
        res.status(201).json({
            _id: newUser._id,
            token: newUser.token,
            account: newUser.account,
        });

    } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
    }
});

// USER LOGIN 

router.post("/user/login", async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });

        const newHash = SHA256(req.body.password + user.salt).toString(encBase64);

        if (!user || user.hash !== newHash){
            return res.status(401).json({ message: "Wrong email or password"});
        };

        res.status(200).json({
            _id: user._id,        
            token: user.token,
            account: user.account,
        });

    } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
    };
});

module.exports = router;