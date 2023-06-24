const Contact = require('../models/contact');
const updateStatusContact = require('../utils/updateStatusContact ');
const Joi = require("joi");
const HttpError = require("../utils/HttpError");

const addSchema = Joi.object({
  name: Joi.string()
    .min(5)
    .max(20)
    .pattern(/^[A-Z]+[a-z]+ [A-Z]+[a-z]+$/)
    .required(),
  email: Joi.string().email().required(),
  phone: Joi.string()
    .pattern(/^([(]\d{3}[)])+ \d{3}-\d{4}$/)
    .required(),
  favorite: Joi.boolean(),
});

const updateFavoriteSchema = Joi.object({
  favorite: Joi.boolean().required(),
});

const listContacts = async (req, res, next) => {
  try {
    const { _id} = req.user;
    const listContacts = await Contact.find({owner: _id});
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
    const { error } = addSchema.validate({ name, email, phone });
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
    const { error } = addSchema.validate({ name, email, phone });
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
    const { error } = updateFavoriteSchema.validate(req.body);
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
