const { Contact } = require('../models');
const {
  contactsJoiSchemas,
  HttpError,
  updateStatusContact,
} = require("../utils");

const listContacts = async (req, res, next) => {
  try {
    const { _id } = req.user;
    const { page = 1, limit = 20, favorite } = req.query;

    const skip = (page - 1) * limit;

    const filterOptions = favorite ? {favorite: favorite} : {};

    const listContacts = await Contact.find({ owner: _id, ...filterOptions }, "", {
      skip,
      limit,
    });
    res.status(200).json(listContacts);
  } catch (error) {
    next(error);
  }
};

const getContactById = async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const contactById = await Contact.findById(contactId);
    if (!contactById) throw HttpError(404, "Not Found");

    res.status(200).json(contactById);
  } catch (error) {
    next(error);
  }
};

const addContact = async (req, res, next) => {
  try {
    const { _id } = req.user;
    const { name, email, phone } = req.body;
    const { error } = contactsJoiSchemas.addSchema.validate({
      name,
      email,
      phone,
    });
    if (error) throw HttpError(400, "missing required name field");

    const addedContact = await Contact.create({...req.body, owner: _id});
    res.status(201).json(addedContact);
  } catch (error) {
    next(error);
  }
};

const removeContact = async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const removedContact = await Contact.findByIdAndDelete(contactId);
    if (!removedContact) throw HttpError(404, "Not found");

    res.status(200).json({ message: "contact deleted" });
  } catch (error) {
    next(error);
  }
};

const updateContact = async (req, res, next) => {
  try {
    const { name, email, phone } = req.body;
    const { error } = contactsJoiSchemas.addSchema.validate({
      name,
      email,
      phone,
    });
    if (error) throw HttpError(400, "missing fields");

    const { contactId } = req.params;
    const updatedContact = await Contact.findByIdAndUpdate(contactId, req.body, {new: true});
    if (!updatedContact) throw HttpError(404, "Not found");

    res.status(200).json(updatedContact);
  } catch (error) {
    next(error);
  }
};

const updateFavorite = async (req, res, next) => {
  try {
    const { error } = contactsJoiSchemas.updateFavoriteSchema.validate(req.body);
    if (error) throw HttpError(400, "missing field favorite");

    const { contactId } = req.params;
   
    const updatedFavorite = await updateStatusContact(contactId, req.body);
    if (!updatedFavorite) throw HttpError(404, "Not found");

    res.status(200).json(updatedFavorite);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listContacts,
  getContactById,
  addContact,
  removeContact,
  updateContact,
  updateFavorite,
};
