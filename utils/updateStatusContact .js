const Contact = require('../models/contact');

const updateStatusContact = async (contactId, body) => {

    const updatedFavorite = await Contact.findByIdAndUpdate(
      contactId,
      body,
      { new: true }
    );

    return updatedFavorite;
};

module.exports = updateStatusContact;