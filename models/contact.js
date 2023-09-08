const { Schema, model } = require("mongoose");
const Joi = require("joi");

const { handleMongooseError } = require("../helpers");

const emailRegexp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

const contactSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Set name for contact'],
    },
    email: {
        type: String,
      required: true,
      match: emailRegexp,
    },
    phone: {
        type: String,
        required: true,
    },
    favorite: {
        type: Boolean,
        default: false,
  },
  owner: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "user",
    },
}, { versionKey: false, timestamps: true }); 

contactSchema.post("save", handleMongooseError);

const contactsSchema = Joi.object({
  name: Joi.string().trim().required().messages({
    "string.empty": "name field is required",
    "any.required": "missing required name field",
  }),
  email: Joi.string().trim().pattern(emailRegexp).required().messages({
    "string.empty": "email field is required",
    "any.required": "missing required email field",
  }),
  phone: Joi.string().trim().required().messages({
    "string.empty": "phone field is required",
    "any.required": "missing required phone field",
  }),
  favorite: Joi.boolean(),
});

const updateFavoriteSchema = Joi.object({
  favorite: Joi.boolean().required(),
});

const schemas = { contactsSchema, updateFavoriteSchema };

const Contact = model("contact", contactSchema);

module.exports = { Contact, schemas };