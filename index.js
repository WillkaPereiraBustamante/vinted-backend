const express = require("express");
require('dotenv').config();
const mongoose = require("mongoose");
const app = express();
const cors = require("cors");
app.use(cors());
const userRouter = require("./routes/user.js");
const offerRouter = require("./routes/offer.js");
const cloudinary = require("cloudinary").v2;
const convertToBase64 = require("./utils/converTobase64.js")


app.use(express.json()); 
app.use(userRouter);
app.use(offerRouter);

mongoose.connect(process.env.MONGODB_URI);

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
  });

app.get("/", (req, res) => {
        res.status(200).json({ message: "Bienvenue sur Vinted" });
});

app.all("*", (req, res) => {
    console.log("=> all route");
    res.status(404).json({ message: "Not found" });
});
  
app.listen(process.env.PORT, () => {
    console.log("server started 🚀");
});
  
