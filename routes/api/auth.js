const express = require("express");
const { ctrlAuth } = require('../../controllers');
const { authenticate, upload } = require("../../middlewares");

const router = express.Router();

router.post("/register", ctrlAuth.registerUser);

router.post("/login", ctrlAuth.loginUser);

router.post("/logout", authenticate, ctrlAuth.logoutUser);

router.get("/current", authenticate, ctrlAuth.getCurrentUser);

router.patch("/subscription", authenticate, ctrlAuth.updateSubscription);

router.patch("/avatars", authenticate, upload.single("avatar"), ctrlAuth.updateAvatar);


module.exports = router;