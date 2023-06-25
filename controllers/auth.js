const { User } = require("../models");
const { authJoiSchemas, HttpError } = require("../utils");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require("dotenv").config();

const { JWT_SECRET } = process.env;

const registerUser = async (req, res, next) => {
  try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });

      if (user) throw HttpError(409, "Email in use");
      
    const { error } = authJoiSchemas.registerSchema.validate(req.body);
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

const loginUser = async (req, res, next) => {
  try {
    const { error } = authJoiSchemas.loginSchema.validate(req.body);
    if (error) throw HttpError(400, "missing required name field");

    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) throw HttpError(401, "Email or password is wrong");
    
    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) throw HttpError(401, "Email or password is wrong");
    
    const payload = {
      id: user._id,
    }
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "23h" });
    await User.findByIdAndUpdate(user._id, { token });

    res.status(200).json({
      "token": token,
      "user": {
        "email": user.email,
        "subscription": user.subscription,
      }
    })

   }
  catch (error) { next(error); }
}

const logoutUser = async (req, res, next) => {
  try { 
    const { _id } = req.user;
    await User.findByIdAndUpdate(_id, { token: "" });

    res.status(204).json({
      message: "logout success..."
    });
  }
  catch (error) { next(error); }
}

const getCurrentUser = async (req, res, next) => {
  try { 
    const { email, subscription } = req.user;

    res.status(200).json({
      email,
      subscription,
    });

  }
  catch (error) { next(error); }
}

const updateSubscription = async (req, res, next) => {
  try {
    const { error } = authJoiSchemas.updateSubscriptionSchema.validate(req.body);
    if (error) throw HttpError(400, "missing required name field");

    const { _id } = req.user;
    const { subscription } = req.body;
    const user = await User.findByIdAndUpdate(
      _id,
      { subscription },
      { new: true }
    );

    res.status(200).json({
      email: user.email,
      subscription: user.subscription,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  updateSubscription,
};