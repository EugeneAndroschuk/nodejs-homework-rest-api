const { isValidObjectId } = require('mongoose');
const HttpError = require('../utils/HttpError');

const isValidId = (req, res, next) => {
    const { contactId } = req.params;
    if (!isValidObjectId(contactId)) next(HttpError(400, `${contactId} is not valid, please enter correct id`));
    
    next();
}

module.exports = isValidId;