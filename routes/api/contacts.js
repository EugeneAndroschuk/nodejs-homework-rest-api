const express = require("express");
// const controllers = require('../../controllers/contacts');
const {controllers} = require("../../controllers");
const { isValidId, authenticate } = require("../../middlewares");

const router = express.Router();

router.get("/", authenticate, controllers.listContacts);

router.get("/:contactId", authenticate, isValidId, controllers.getContactById);

router.post("/", authenticate, controllers.addContact);

router.delete("/:contactId", authenticate, isValidId, controllers.removeContact);

router.put("/:contactId", authenticate, isValidId, controllers.updateContact);

router.patch("/:contactId/favorite", authenticate, isValidId, controllers.updateFavorite);

module.exports = router;
