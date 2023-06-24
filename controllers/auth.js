const User = require("../models/user");
const Joi = require("joi");
const bcrypt = require('bcrypt');
const HttpError = require("../utils/HttpError");
const jwt = require('jsonwebtoken');
require("dotenv").config();

const { SECRET_KEY } = process.env;

const registerSchema = Joi.object({
  password: Joi.string().required(),
  email: Joi.string().email().required(),
  subscription: Joi.string()
    .valid(...["starter", "pro", "business"]),
  token: Joi.string(),
});

const loginSchema = Joi.object({
  password: Joi.string().required(),
  email: Joi.string().email().required(),
});

const register = async (req, res, next) => {
  try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });

      if (user) throw HttpError(409, "Email in use");
      
    const { error } = registerSchema.validate(req.body);
    if (error) throw HttpError(400, "missing required name field");

    const hashPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({ ...req.body, password: hashPassword });
      res.status(201).json({
        user: {
          email: newUser.email,
          subscription: newUser.subscription,
        },
      });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) throw HttpError(400, "missing required name field");

    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) throw HttpError(401, "Email or password is wrong");
    
    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) throw HttpError(401, "Email or password is wrong");
    
    const payload = {
      id: user._id,
    }
    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "23h" });

    res.status(200).json({
      "token": token,
      "user": {
        "email": user.email,
        "subscription": user.subscription,
      }
    })

   }
  catch(error) {next(error);}
}

module.exports = {
  register,
  login,
};