const Joi = require("joi");

const registerSchema = Joi.object({
  name: Joi.string().required(),
  password: Joi.string().required(),
  email: Joi.string().email().required(),
  subscription: Joi.string().valid(...["starter", "pro", "business"]),
  token: Joi.string(),
});

const loginSchema = Joi.object({
  password: Joi.string().required(),
  email: Joi.string().email().required(),
});

const updateSubscriptionSchema = Joi.object({
  subscription: Joi.string()
    .valid(...["starter", "pro", "business"])
    .required(),
});

const resendEmailSchema = Joi.object({
  email: Joi.string().email().required(),
});

module.exports = {
  registerSchema,
  loginSchema,
  updateSubscriptionSchema,
  resendEmailSchema,
};