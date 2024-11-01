const express = require("express");
const Offer = require("../models/Offer.js");
const router = express.Router();
const fileUpload = require("express-fileupload");
const isAuthenticated = require("../middlewares/isAuthenticated");
const cloudinary = require("cloudinary").v2;
const convertToBase64 = require("../utils/converTobase64.js")


// PUBLISH OFFER
router.post("/offer/publish", isAuthenticated, fileUpload(), async (req, res) => {
    try {
        const picture = req.files.picture;
        const fileConverted = await cloudinary.uploader.upload(convertToBase64(picture));
        const { title, description, price, brand, size, condition, color, city} = req.body;

        const newOffre = await new Offer({
            product_name: title,
            product_description: description,
            product_price: price,
            product_details: [
                {"MARQUE": brand},
                {"TAILLE": size},
                {"ETAT": condition},
                {"COULEUR": color},
                {"EMPLACEMENT": city},
            ],
            product_image: fileConverted,
            owner: req.user.id,
        });

        await newOffre.save();
        
        res.status(201).json({
            _id: newOffre._id,
            product_name: title,
            product_description: description,
            product_price: price,
            product_details: [
                {MARQUE: brand},
                {TAILLE: size},
                {ÉTAT: condition},
                {COULEUR: color},
                {EMPLACEMENT: city}
            ],
            owner: {
                account: {
                    username: req.user.account.username,
                    avatar: { secure_url: req.user.account.avatar.secure_url }
                },
                _id: req.user.id
            },
            product_image: { secure_url: newOffre.product_image.secure_url }
        });

    } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
    }
});

// GET OFFERS
router.get("/offers", async (req, res) => {
    try {

        const { title, priceMin, priceMax, sort, page} = req.query;
        const limit = 5;

        const filters = {};

        if (title) {filters.product_name = new RegExp(title, "i");};
        if (priceMax) {
            filters.product_price = { $lte: Number(priceMax) };
        };
        if (priceMin) {
            if (filters.product_price) {
                filters.product_price.$gte = Number(priceMin)
            } else {
                filters.product_price = { $gte: Number(priceMin) };
            }
        };

        const sortByPrice = {};
        if (sort === "price-desc") { sortByPrice.product_price = "desc" };
        if (sort === "price-asc") { sortByPrice.product_price = "asc" };

        const numPage = {};
        if (page) { numPage.page = (page*limit)-limit};

        const counter = await Offer.find(filters).length;
        
        const offers = await Offer.find(filters)
        .sort(sortByPrice.product_price)
        .skip(numPage.page)
        .limit(limit)
        .populate('owner', 'account')
        
        res.status(200).json({
            "count": counter,
            "offres": offers
        });
    } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
    }
});


//UPDATE OFFER
// router.put("/offer/:id", isAuthenticated, fileUpload(), async (req, res) => {
//     try {
        
//         const offerId = req.params.id;
//         const { title, description, price, brand, size, condition, color, city} = req.body;
//         const offerToModify = await Offer.findById(offerId);
//         if (title) offerToModify.product_name = title;
//         if (description) offerToModify.product_description = description;
//         if (price) offerToModify.product_price = price;
//         if (brand) offerToModify.product_details[0].MARQUE = brand;
//         if (size) offerToModify.product_details[0].TAILLE = size;
//         if (condition) offerToModify.product_details[0].ÉTAT = condition;
//         if (color) offerToModify.product_details[0].COULEUR = color;
//         if (city) offerToModify.product_details[0].EMPLACEMENT = city;
//         if (!req.files.picture) {
//             offerToModify.product_image;
//         } else {
//             const picture = req.files.picture;
//             const fileConverted = await cloudinary.uploader.upload(convertToBase64(picture));
//             offerToModify.product_image = fileConverted;
//         }

//         await offerToModify.save();
//         // res.status(200).json(offerToModify);
        
//         res.status(201).json({
//             _id: offerId,
//             product_name: title,
//             product_description: description,
//             product_price: price,
//             product_details: [
//                 {MARQUE: brand},
//                 {TAILLE: size},
//                 {ÉTAT: condition},
//                 {COULEUR: color},
//                 {EMPLACEMENT: city}
//             ],
//             owner: {
//                 account: {
//                     username: req.user.account.username,
//                     avatar: { secure_url: req.user.account.avatar.secure_url }
//                 },
//                 _id: req.user.id
//             },
//             product_image: { secure_url: offerToModify.product_image.secure_url }
//         });
//         //res.json("ok")
//     } catch (error) {
//     console.log(error.message);
//     res.status(500).json({ message: error.message });
//     }
// });

module.exports = router;