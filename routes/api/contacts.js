const express = require("express");
const { ctrlContacts } = require("../../controllers");
const { isValidId, authenticate } = require("../../middlewares");

const router = express.Router();

router.get("/", authenticate, ctrlContacts.listContacts);

router.get("/:contactId", authenticate, isValidId, ctrlContacts.getContactById);

router.post("/", authenticate, ctrlContacts.addContact);

router.delete(
  "/:contactId",
  authenticate,
  isValidId,
  ctrlContacts.removeContact
);

router.put("/:contactId", authenticate, isValidId, ctrlContacts.updateContact);

router.patch(
  "/:contactId/favorite",
  authenticate,
  isValidId,
  ctrlContacts.updateFavorite
);

module.exports = router;
