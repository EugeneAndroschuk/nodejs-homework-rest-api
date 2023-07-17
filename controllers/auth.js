const { User } = require("../models");
const { authJoiSchemas, HttpError, sendEmailSendgrid } = require("../utils");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const path = require("path");
const fs = require("fs/promises");
const Jimp = require("jimp");
const { nanoid } = require("nanoid");
require("dotenv").config();

const { JWT_SECRET, BASE_URL } = process.env;
const avatarsDir = path.join(__dirname, "../", "public", "avatars");
const uploadDir = path.join(__dirname, "../", "tmp");
const prodDir = "https://db-phonebook-olo8.onrender.com";
let dir;

if (process.env.NODE_ENV === "production") dir = prodDir; else dir = BASE_URL;

const registerUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user) throw HttpError(409, "Email in use");

    const { error } = authJoiSchemas.registerSchema.validate(req.body);
    if (error) throw HttpError(400, "missing required name field");

    const hashPassword = await bcrypt.hash(password, 10);

    const avatarURL = gravatar.url(email);
    const verificationToken = nanoid();

    const newUser = await User.create({
      ...req.body,
      password: hashPassword,
      avatarURL,
      verificationToken,
    });

    const verifyEmail = {
      to: email,
      subject: "Verification email",
      html: `<a target="_blank" href="${dir}/api/users/verify/${verificationToken}">Click to verify your email</a>`,
    };

    await sendEmailSendgrid(verifyEmail);

    res.status(201).json({
      user: {
        name: newUser.name,
        email: newUser.email,
        subscription: newUser.subscription,
      },
    });
  } catch (error) {
    next(error);
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    const { verificationToken } = req.params;
    const user = await User.findOne({ verificationToken });

    if (!user) throw HttpError(404, "User not found");

    await User.findByIdAndUpdate(user._id, {
      verify: true,
      verificationToken: null,
    });

    res.status(200).json({ message: "Verification successful" });
  } catch (error) {
    next(error);
  }
};

const resendVerifyEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    const { error } = authJoiSchemas.resendEmailSchema.validate(req.body);
    if (error) throw HttpError(400, "missing required field email");

    const user = await User.findOne({ email });
    if (!user) throw HttpError(404, "User not found");
    if (user.verify)
      throw HttpError(400, "Verification has already been passed");

    const verifyEmail = {
      to: email,
      subject: "Verification email",
      html: `<a target="_blank" href="${BASE_URL}/api/users/verify/${user.verificationToken}">Click to verify your email</a>`,
    };

    await sendEmailSendgrid(verifyEmail);

    res.status(200).json({ message: "Verification email sent" });
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

    if (!user.verify) throw HttpError(401, "Email is not verified");

    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) throw HttpError(401, "Email or password is wrong");

    const payload = {
      id: user._id,
    };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "23h" });
    await User.findByIdAndUpdate(user._id, { token });

    res.status(200).json({
      token: token,
      user: {
        email: user.email,
        subscription: user.subscription,
      },
    });
  } catch (error) {
    next(error);
  }
};

const logoutUser = async (req, res, next) => {
  try {
    const { _id } = req.user;
    await User.findByIdAndUpdate(_id, { token: "" });

    res.status(204).json({
      message: "logout success...",
    });
  } catch (error) {
    next(error);
  }
};

const getCurrentUser = async (req, res, next) => {
  try {
    const { email, subscription } = req.user;

    res.status(200).json({
      email,
      subscription,
    });
  } catch (error) {
    next(error);
  }
};

const updateSubscription = async (req, res, next) => {
  try {
    const { error } = authJoiSchemas.updateSubscriptionSchema.validate(
      req.body
    );
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
};

const updateAvatar = async (req, res, next) => {
  try {
    const { _id } = req.user;
    const { originalname } = req.file;

    const tmpName = path.join(uploadDir, originalname);
    const fileName = `${_id}_${originalname}`;
    const resultUpload = path.join(avatarsDir, fileName);

    Jimp.read(tmpName, async (err, img) => {
      if (err) throw err;
      await img
        .resize(250, 250) // resize
        .write(resultUpload); // save

      await fs.unlink(tmpName);

      const avatarURL = path.join("avatars", fileName);
      await User.findByIdAndUpdate(_id, { avatarURL });
      res.status(200).json({ avatarURL });
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  verifyEmail,
  resendVerifyEmail,
  loginUser,
  logoutUser,
  getCurrentUser,
  updateSubscription,
  updateAvatar,
};
